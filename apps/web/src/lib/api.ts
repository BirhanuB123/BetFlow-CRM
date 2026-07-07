export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

type Session = {
  accessToken: string;
  tenant?: unknown;
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

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const session = getSession();
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (session?.accessToken) {
    headers.set("Authorization", `Bearer ${session.accessToken}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && typeof window !== "undefined") {
    clearSession();
    if (!window.location.pathname.startsWith("/auth")) {
      window.location.href = "/auth";
    }
  }

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(message || `Request failed (${response.status})`);
  }

  return (await response.json()) as T;
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem("betflow-auth");
  window.sessionStorage.removeItem("betflow-auth");
}
