// Token & session key constants
const TOKEN_KEY = "contractmind_token";
const USER_KEY = "contractmind_user";
const DEMO_KEY = "app_auth_v2";       // set by AuthContext.persistDemo()
const ROLE_HINT_KEY = "cm_role";      // set by AuthContext.login() for quick routing
const ENTERPRISE_PROFILE_KEY = "cm_enterprise_profile";
const LAWYER_PROFILE_KEY = "cm_lawyer_profile";

export interface StoredUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  credit_balance: number;
  is_verified: boolean;
  is_phone_verified: boolean;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  role: string;
  credit_balance: number;
  is_verified: boolean;
  user_id: string;
  email: string;
  full_name: string;
  is_phone_verified: boolean;
}

/**
 * Persist a REAL backend login/verify-otp session.
 *
 * ✅ BUG A FIX:
 *   When a real token is being stored, any stale demo session
 *   (app_auth_v2 from a previous "Login as Demo Lawyer/Admin" click)
 *   MUST be cleared. Otherwise AuthContext's mount effect will
 *   prioritize the demo user after a page refresh, overriding
 *   the actual GENERAL / LAWYER / etc. role stored in the JWT.
 */
export function saveTokenResponse(data: TokenResponse, overrideRole?: string): void {
  if (typeof window === "undefined") return;

  // ✅ BUG A FIX — kill any demo session before writing the real token
  localStorage.removeItem(DEMO_KEY);

  localStorage.setItem(TOKEN_KEY, data.access_token);

  const user: StoredUser = {
    id: data.user_id,
    email: data.email,
    full_name: data.full_name,
    role: (overrideRole || data.role || "general").toLowerCase(),
    credit_balance: data.credit_balance,
    is_verified: data.is_verified,
    is_phone_verified: data.is_phone_verified,
  };
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): StoredUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

/**
 * Wipe every auth-related key.
 *
 * Covers:
 *   • Real JWT + stored user (contractmind_token, contractmind_user)
 *   • Demo session (app_auth_v2) — set by AuthContext.persistDemo()
 *   • Role hint (cm_role) — set by AuthContext.login() before /me resolves
 *
 * Called on:
 *   • logout()
 *   • 401 from any API call
 *   • saveTokenResponse() — partial (only DEMO_KEY)
 */
export function clearAuth(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(DEMO_KEY);
  localStorage.removeItem(ROLE_HINT_KEY);
  localStorage.removeItem(ENTERPRISE_PROFILE_KEY);
  localStorage.removeItem(LAWYER_PROFILE_KEY);
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

/**
 * Quick role hint for redirects right after login,
 * before /api/auth/me finishes fetching.
 * Returns uppercase, e.g. "LAWYER", "GENERAL", "ADMIN".
 */
export function getRoleHint(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ROLE_HINT_KEY);
}

export function setRoleHint(role: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ROLE_HINT_KEY, String(role).toUpperCase());
}