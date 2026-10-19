// Token & session key constants
const TOKEN_KEY = "contractmind_token";
const USER_KEY = "contractmind_user";

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

export function saveTokenResponse(data: TokenResponse, overrideRole?: string): void {
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

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  // Also clear old demo auth key if present
  localStorage.removeItem("app_auth_v2");
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
