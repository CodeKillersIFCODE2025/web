import { getAuthHeader } from "@/lib/auth";

type ReqInit = Omit<RequestInit, "headers"> & { headers?: Record<string,string> };

export async function http<T = unknown>(url: string, init: ReqInit = {}): Promise<T> {
  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeader(),   // injeta Basic automaticamente
    ...(init.headers || {}),
  };
  const res = await fetch(url, { ...init, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const get  = <T=unknown>(url: string) => http<T>(url);
export const post = <T=unknown>(url: string, body?: unknown) =>
  http<T>(url, { method: "POST", body: body ? JSON.stringify(body) : undefined });
export const put  = <T=unknown>(url: string, body?: unknown) =>
  http<T>(url, { method: "PUT", body: body ? JSON.stringify(body) : undefined });
export const del  = <T=unknown>(url: string) =>
  http<T>(url, { method: "DELETE" });
