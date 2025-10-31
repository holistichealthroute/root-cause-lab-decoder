// src/api/http.ts
import { toast } from "react-toastify";
import { config } from "../utils/config";

export const BASE = config.API_URL;

const TOKEN_KEY = "token";
const REFRESH_TOKEN_KEY = "refresh_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t: string | null) =>
  t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY);

export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);
export const setRefreshToken = (t: string | null) =>
  t
    ? localStorage.setItem(REFRESH_TOKEN_KEY, t)
    : localStorage.removeItem(REFRESH_TOKEN_KEY);

export class ApiError extends Error {
  status: number;
  data: any;
  constructor(message: string, status: number, data: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export type RequestOptions = {
  silent?: boolean;
};
export let onUnauthorized = () => {
  window.location.href = "/login";
};
export let onHttpError: ((err: ApiError) => void) | undefined;

export async function request<T = any>(
  path: string,
  init: RequestInit = {},
  options: { silent?: boolean } = {}
): Promise<T> {
  // Prepare headers
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string> | undefined),
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    let res = await fetch(`${BASE}${path}`, { ...init, headers });
    let data = await res.json().catch(() => ({}));

    if (!res.ok && res.status === 401 && getRefreshToken()) {
      // Try refresh token flow
      try {
        const refreshRes = await fetch(`${BASE}/auth/refresh-token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: getRefreshToken() }),
        });
        const refreshData = await refreshRes.json();
        if (refreshRes.ok && refreshData.access_token) {
          setToken(refreshData.access_token);
          if (refreshData.refresh_token)
            setRefreshToken(refreshData.refresh_token);

          if (!init.headers) init.headers = {};
          (init.headers as Record<string, string>)[
            "Authorization"
          ] = `Bearer ${refreshData.access_token}`;
          res = await fetch(`${BASE}${path}`, {
            ...init,
            headers: init.headers,
          });
          data = await res.json().catch(() => ({}));
          if (res.ok) return data as T;
        } else {
          setToken(null);
          setRefreshToken(null);
          onUnauthorized?.();
        }
      } catch {
        setToken(null);
        setRefreshToken(null);
        onUnauthorized?.();
      }
    }

    if (!res.ok) {
      const err = new ApiError(
        data?.detail || data?.message || "Request failed",
        res.status,
        data
      );
      if (res.status === 401) {
        setToken(null);
        setRefreshToken(null);
        onUnauthorized?.();
      }
      if (!options.silent) onHttpError?.(err);
      throw err;
    }
    return data as T;
  } catch (e: any) {
    if (e instanceof ApiError) throw e;
    const err = new ApiError(e?.message || "Network error", 0, null);
    if (!options.silent) onHttpError?.(err);
    throw err;
  }
}
export const get = <T>(p: string, opts?: RequestOptions) =>
  request<T>(p, {}, opts);
export const post = <T>(p: string, body?: unknown, opts?: RequestOptions) =>
  request<T>(
    p,
    { method: "POST", body: body ? JSON.stringify(body) : undefined },
    opts
  );

export async function fetchBlob(url: string, data: any) {
  url = `${BASE}${url}`;
  const token = localStorage.getItem("token");
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  return response;
}

export async function fetchBlobGet(url: string): Promise<Blob> {
  url = `${BASE}${url}`;
  const token = localStorage.getItem("token");
  const response = await fetch(url, {
    method: "GET",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!response.ok) throw new Error("Failed to fetch blob");
  return await response.blob();
}

export async function postFormData<T = any>(
  path: string,
  formData: FormData,
  opts?: RequestOptions
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  // Do NOT set Content-Type for FormData!

  try {
    const res = await fetch(`${BASE}${path}`, {
      method: "POST",
      headers,
      body: formData,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new ApiError(
        data?.detail || data?.message || "Request failed",
        res.status,
        data
      );
      if (res.status === 401) {
        setToken(null);
        setRefreshToken(null);
        onUnauthorized?.();
      }
      if (!opts?.silent) onHttpError?.(err);
      throw err;
    }
    return data as T;
  } catch (e: any) {
    if (e instanceof ApiError) throw e;
    const err = new ApiError(e?.message || "Network error", 0, null);
    if (!opts?.silent) onHttpError?.(err);
    throw err;
  }
}
