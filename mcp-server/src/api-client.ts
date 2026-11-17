import { config } from "./config.js";
import { sessionStore } from "./session-store.js";

export class ApiClientError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  body?: any;
  params?: Record<string, string | number | boolean | undefined>;
  sessionId?: string;
  requiresAuth?: boolean;
}

export async function requestBackend<T = any>(opts: RequestOptions): Promise<T> {
  const { method = "GET", path, body, params, sessionId, requiresAuth = false } = opts;

  // Check auth requirement before dispatching
  if (requiresAuth && !sessionStore.isAuthenticated(sessionId)) {
    throw new ApiClientError(
      "Authentication required: You are not currently logged in. " +
        "Please ask me to log in with your account using `login_account` or create a new account using `register_account`.",
      401
    );
  }

  // Construct URL with query parameters
  const url = new URL(`${config.baseUrl}${path.startsWith("/") ? path : `/${path}`}`);
  if (params) {
    for (const [key, val] of Object.entries(params)) {
      if (val !== undefined && val !== null && val !== "") {
        url.searchParams.append(key, String(val));
      }
    }
  }

  // Build headers
  const authHeader = sessionStore.getAuthHeader(sessionId);
  if (authHeader.Authorization) {
    const user = sessionStore.get(sessionId)?.user?.email || "authenticated user";
    console.log(`[API] 🔑 Attached Bearer JWT for ${user} to ${method} ${url.pathname}`);
  } else {
    console.log(`[API] 🌐 Public call to ${method} ${url.pathname}`);
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...authHeader,
  };

  let payload: string | undefined;
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.apiTimeoutMs);

  try {
    const response = await fetch(url.toString(), {
      method,
      headers,
      body: payload,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const contentType = response.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    
    let responseData: any;
    if (isJson) {
      responseData = await response.json();
    } else {
      const text = await response.text();
      responseData = { message: text };
    }

    if (!response.ok) {
      const errMsg =
        responseData?.message ||
        responseData?.error ||
        `Request failed with status ${response.status}: ${response.statusText}`;
      throw new ApiClientError(errMsg, response.status, responseData);
    }

    // CINE-AI backend wraps responses in ApiResponse { success: true, message: "...", data: ... }
    if (responseData && typeof responseData === "object" && "data" in responseData) {
      return responseData.data as T;
    }

    return responseData as T;
  } catch (err: any) {
    clearTimeout(timeoutId);

    if (err instanceof ApiClientError) {
      throw err;
    }

    if (err.name === "AbortError") {
      throw new ApiClientError(
        `Backend request to ${url.pathname} timed out after ${config.apiTimeoutMs}ms. The server might be waking up or overloaded.`,
        504
      );
    }

    const networkCode = err.cause?.code || err.code;
    if (networkCode === "ECONNREFUSED" || networkCode === "ENOTFOUND") {
      throw new ApiClientError(
        `Unable to reach CINE-AI backend at ${config.baseUrl} (${networkCode}). Please verify that your backend service on Railway is active and accessible.`,
        503
      );
    }

    throw new ApiClientError(err.message || "An unexpected error occurred during backend communication.", 500);
  }
}

/** Automatically attempt login if CINEAI_USER_EMAIL & CINEAI_USER_PASSWORD are set */
export async function initializeDefaultAuth(): Promise<void> {
  if (config.defaultUserEmail && config.defaultUserPassword) {
    try {
      console.log(`[AUTH] Auto-authenticating default user: ${config.defaultUserEmail}...`);
      const authRes = await requestBackend({
        method: "POST",
        path: "/api/auth/login",
        body: {
          email: config.defaultUserEmail,
          password: config.defaultUserPassword,
        },
      });

      if (authRes && authRes.token) {
        sessionStore.set(undefined, {
          token: authRes.token,
          user: authRes.user,
        });
        console.log(`[AUTH] ✓ Successfully authenticated default user: ${config.defaultUserEmail}`);
      }
    } catch (err: any) {
      console.warn(`[AUTH] ⚠ Failed to pre-authenticate default user: ${err.message}`);
    }
  }
}

