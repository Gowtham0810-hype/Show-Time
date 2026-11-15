export interface UserSessionData {
  token: string;
  user: {
    id: number;
    fullName: string;
    email: string;
    role: string;
  };
  lastHoldToken?: string;
  lastHoldExpiresAt?: number;
  updatedAt: number;
}

class SessionStore {
  private sessions = new Map<string, UserSessionData>();
  private defaultSession: UserSessionData | null = null;

  /** Get auth data for a given session, or fall back to default */
  get(sessionId?: string): UserSessionData | null {
    if (sessionId && this.sessions.has(sessionId)) {
      return this.sessions.get(sessionId)!;
    }
    return this.defaultSession;
  }

  /** Set auth data for a specific session */
  set(sessionId: string | undefined, data: { token: string; user: any; lastHoldToken?: string }): void {
    const sessionData: UserSessionData = {
      token: data.token,
      user: {
        id: data.user.id,
        fullName: data.user.fullName || data.user.name || "User",
        email: data.user.email,
        role: data.user.role || "USER",
      },
      lastHoldToken: data.lastHoldToken,
      updatedAt: Date.now(),
    };

    if (sessionId) {
      this.sessions.set(sessionId, sessionData);
    }
    // Also update default session so single-user mode stays synchronized
    this.defaultSession = sessionData;
  }

  /** Store a temporary seat hold token in session */
  setHoldToken(sessionId: string | undefined, holdToken: string, ttlSeconds: number = 300): void {
    const session = this.get(sessionId);
    if (session) {
      session.lastHoldToken = holdToken;
      session.lastHoldExpiresAt = Date.now() + ttlSeconds * 1000;
    } else if (this.defaultSession) {
      this.defaultSession.lastHoldToken = holdToken;
      this.defaultSession.lastHoldExpiresAt = Date.now() + ttlSeconds * 1000;
    } else {
      // Store ephemeral hold even if unauthenticated
      this.defaultSession = {
        token: "",
        user: { id: 0, fullName: "Guest", email: "", role: "USER" },
        lastHoldToken: holdToken,
        lastHoldExpiresAt: Date.now() + ttlSeconds * 1000,
        updatedAt: Date.now(),
      };
    }
  }

  /** Clear session on logout */
  clear(sessionId?: string): void {
    if (sessionId) {
      this.sessions.delete(sessionId);
    }
    if (!sessionId || this.sessions.size === 0) {
      this.defaultSession = null;
    }
  }

  /** Returns Authorization header if logged in */
  getAuthHeader(sessionId?: string): Record<string, string> {
    const session = this.get(sessionId);
    if (session && session.token) {
      return { Authorization: `Bearer ${session.token}` };
    }
    return {};
  }

  /** Check if session is logged in */
  isAuthenticated(sessionId?: string): boolean {
    const session = this.get(sessionId);
    return Boolean(session && session.token);
  }
}

export const sessionStore = new SessionStore();
