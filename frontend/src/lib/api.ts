/**
 * Central API client for ContractMind.
 * Uses the NEXT_PUBLIC_API_URL env var (falls back to localhost:8000 for dev).
 * Automatically attaches Bearer token on every request.
 * On 401 responses, clears auth and redirects to home.
 */
import { getToken, clearAuth } from "@/lib/auth";

const LIVE_BACKEND_URL = "https://legal-copilot-backend-npq7.onrender.com";

const BASE_URL =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL) ||
  LIVE_BACKEND_URL;

type RequestMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface ApiOptions {
  method?: RequestMethod;
  body?: Record<string, unknown> | FormData;
  headers?: Record<string, string>;
  /** Skip JSON serialisation (for FormData uploads) */
  isFormData?: boolean;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public detail: string
  ) {
    super(detail);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  options: ApiOptions = {}
): Promise<T> {
  const { method = "GET", body, headers = {}, isFormData = false } = options;

  const token = getToken();
  const reqHeaders: Record<string, string> = { ...headers };

  if (token) {
    reqHeaders["Authorization"] = `Bearer ${token}`;
  }

  if (!isFormData) {
    reqHeaders["Content-Type"] = "application/json";
    reqHeaders["Accept"] = "application/json";
  }

  const fullUrl = `${BASE_URL}${path}`;
  console.log(`[API Call] ${method} ${fullUrl}`, body);

  let res: Response;
  try {
    res = await fetch(fullUrl, {
      method,
      headers: reqHeaders,
      body:
        body !== undefined
          ? isFormData
            ? (body as FormData)
            : JSON.stringify(body)
          : undefined,
    });
  } catch (netErr) {
    console.error(`[API Network Error] ${method} ${fullUrl}:`, netErr);
    throw new ApiError(0, "Network connection error. Please verify backend connectivity.");
  }

  if (res.status === 401) {
    clearAuth();
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
    throw new ApiError(401, "Session expired. Please log in again.");
  }

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const json = await res.json();
      detail = json?.detail ?? json?.message ?? detail;
    } catch {
      /* noop */
    }
    console.error(`[API Error] ${res.status} ${fullUrl}:`, detail);
    throw new ApiError(res.status, detail);
  }

  // 204 No Content
  if (res.status === 204) {
    console.log(`[API Success] 204 No Content ${fullUrl}`);
    return undefined as T;
  }

  const data = await res.json();
  console.log(`[API Success] ${res.status} ${fullUrl}`, data);
  return data as T;
}

// ─── Convenience wrappers ───────────────────────────────────────────────────

export const api = {
  get: <T>(path: string, extraHeaders?: Record<string, string>) =>
    request<T>(path, { method: "GET", headers: extraHeaders }),

  post: <T>(
    path: string,
    body?: Record<string, unknown>,
    extraHeaders?: Record<string, string>
  ) => request<T>(path, { method: "POST", body, headers: extraHeaders }),

  patch: <T>(
    path: string,
    body?: Record<string, unknown>,
    extraHeaders?: Record<string, string>
  ) => request<T>(path, { method: "PATCH", body, headers: extraHeaders }),

  put: <T>(
    path: string,
    body?: Record<string, unknown>,
    extraHeaders?: Record<string, string>
  ) => request<T>(path, { method: "PUT", body, headers: extraHeaders }),

  delete: <T>(path: string, extraHeaders?: Record<string, string>) =>
    request<T>(path, { method: "DELETE", headers: extraHeaders }),

  upload: <T>(path: string, formData: FormData) =>
    request<T>(path, {
      method: "POST",
      body: formData,
      isFormData: true,
    }),
};

export default api;
