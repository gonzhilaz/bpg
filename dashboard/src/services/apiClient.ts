import { getEnvUrl } from "../utils/env";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error?: unknown;
}

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

export class ApiClient {
  private static getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("13c_token") || sessionStorage.getItem("13c_token");
  }

  public static async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<{ data: T | null; error: string | null; status: number }> {
    const baseUrl = getEnvUrl.api();
    let url = `${baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

    if (options.params) {
      const searchParams = new URLSearchParams();
      Object.entries(options.params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "") {
          searchParams.append(key, String(val));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += (url.includes("?") ? "&" : "?") + queryString;
      }
    }

    const headers = new Headers(options.headers || {});
    if (!headers.has("Content-Type") && options.body && typeof options.body === "string") {
      headers.set("Content-Type", "application/json");
    }

    const token = this.getToken();
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    try {
      const res = await fetch(url, {
        ...options,
        headers,
      });

      const json: ApiResponse<T> = await res.json().catch(() => null);

      if (!res.ok) {
        const errorMsg = json?.message || `HTTP ${res.status}: ${res.statusText}`;
        return { data: null, error: errorMsg, status: res.status };
      }

      if (json && json.success === false) {
        return { data: null, error: json.message || "Request failed", status: res.status };
      }

      return { data: json?.data ?? null, error: null, status: res.status };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Network error / Backend unreachable";
      return { data: null, error: errMsg, status: 0 };
    }
  }

  public static get<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>) {
    return this.request<T>(endpoint, { method: "GET", params });
  }

  public static post<T>(endpoint: string, body?: unknown) {
    return this.request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public static put<T>(endpoint: string, body?: unknown) {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public static patch<T>(endpoint: string, body?: unknown) {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public static delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}
