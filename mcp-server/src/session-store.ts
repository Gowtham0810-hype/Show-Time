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
  private activeUserSession: UserSessionData | null = null;

  /** Get auth data for a given session, or fall back to the active user session */
  get(sessionId?: string): UserSessionData | null {
    if (sessionId && this.sessions.has(sessionId)) {
      return this.sessions.get(sessionId)!;
    }
    return this.activeUserSession;
  }

  /** Set auth data for a session and persist as active user session */
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
    // Persist as the active user session across any rotating Claude worker connections!
    this.activeUserSession = sessionData;
    console.log(`[AUTH] Session activated for ${sessionData.user.email} (token length: ${sessionData.token.length})`);
  }

  /** Store a temporary seat hold token */
  setHoldToken(sessionId: string | undefined, holdToken: string, ttlSeconds: number = 300): void {
    const session = this.get(sessionId);
    if (session) {
      session.lastHoldToken = holdToken;
      session.lastHoldExpiresAt = Date.now() + ttlSeconds * 1000;
    } else if (this.activeUserSession) {
      this.activeUserSession.lastHoldToken = holdToken;
      this.activeUserSession.lastHoldExpiresAt = Date.now() + ttlSeconds * 1000;
    } else {
      this.activeUserSession = {
        token: "",
        user: { id: 0, fullName: "Guest", email: "", role: "USER" },
        lastHoldToken: holdToken,
        lastHoldExpiresAt: Date.now() + ttlSeconds * 1000,
        updatedAt: Date.now(),
      };
    }
  }

  /** Explicit user logout */
  logout(sessionId?: string): void {
    if (sessionId) {
      this.sessions.delete(sessionId);
    }
    this.activeUserSession = null;
    console.log(`[AUTH] User session explicitly logged out.`);
  }

  /** Compatibility clear method */
  clear(sessionId?: string): void {
    this.logout(sessionId);
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
