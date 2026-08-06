export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

type Session = {
  accessToken: string;
  tenant?: { currency?: string };
  user?: unknown;
};

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  // Rembeber me
  const saved =
    window.localStorage.getItem("betflow-auth") ??
    window.sessionStorage.getItem("betflow-auth");
  if (!saved) return null;
  try {
    return JSON.parse(saved) as Session;
  } catch {
    return null;
  }
}

export interface ApiFetchOptions extends RequestInit {
  suppressAuthRedirect?: boolean;
}

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { suppressAuthRedirect, ...fetchOptions } = options;
  const session = getSession();
  const headers = new Headers(fetchOptions.headers);
  headers.set("Content-Type", "application/json");
  if (session?.accessToken) {
    headers.set("Authorization", `Bearer ${session.accessToken}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...fetchOptions,
    headers,
  });

  if (response.status === 401 && typeof window !== "undefined") {
    if (!suppressAuthRedirect) {
      clearSession();
      if (!window.location.pathname.startsWith("/auth")) {
        window.location.href = "/auth";
      }
    }
  }

  if (!response.ok) {
    const rawText = await response.text().catch(() => "");
    let parsedMessage = rawText;
    try {
      const json = JSON.parse(rawText);
      if (json.message) {
        parsedMessage = Array.isArray(json.message) ? json.message.join(", ") : String(json.message);
      }
    } catch {}
    throw new Error(parsedMessage || `Request failed (${response.status})`);
  }

  return (await response.json()) as T;
}

export async function apiUpload<T>(path: string, body: FormData): Promise<T> {
  const session = getSession();
  const headers = new Headers();
  if (session?.accessToken) headers.set("Authorization", `Bearer ${session.accessToken}`);

  const response = await fetch(`${API_BASE_URL}${path}`, { method: "POST", headers, body });
  if (response.status === 401 && typeof window !== "undefined") {
    clearSession();
    if (!window.location.pathname.startsWith("/auth")) window.location.href = "/auth";
  }
  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(message || `Request failed (${response.status})`);
  }
  return (await response.json()) as T;
}

export async function apiDownload(path: string): Promise<Blob> {
  const session = getSession();
  const headers = new Headers();
  if (session?.accessToken) headers.set("Authorization", `Bearer ${session.accessToken}`);
  const response = await fetch(`${API_BASE_URL}${path}`, { headers });
  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(message || `Request failed (${response.status})`);
  }
  return response.blob();
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem("betflow-auth");
  window.sessionStorage.removeItem("betflow-auth");
}

export function updateSessionCurrency(currency: string) {
  if (typeof window === "undefined") return;
  const storage = window.localStorage.getItem("betflow-auth")
    ? window.localStorage
    : window.sessionStorage;
  const raw = storage.getItem("betflow-auth");
  if (!raw) return;
  try {
    const session = JSON.parse(raw) as Session;
    storage.setItem("betflow-auth", JSON.stringify({
      ...session,
      tenant: { ...session.tenant, currency },
    }));
  } catch {
    // A malformed session is handled by getSession on the next API request.
  }
}
