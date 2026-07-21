import { apiFetch, clearSession } from "@/lib/api";
import type { AuthenticatedUser } from "@betflow/shared";

export type LoginCredentials = {
  email: string;
  password?: string;
};

export type LoginResponse = {
  accessToken: string;
  user: AuthenticatedUser;
};

/**
 * Service for interacting with Authentication API endpoints.
 */
export const authService = {
  /** Authenticate user with credentials */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const data = await apiFetch<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    if (data.accessToken && typeof window !== "undefined") {
      window.localStorage.setItem("betflow-auth", JSON.stringify(data));
    }

    return data;
  },

  /** Fetch current authenticated profile */
  async getProfile(): Promise<AuthenticatedUser> {
    return apiFetch<AuthenticatedUser>("/auth/me");
  },

  /** Log out user and clear local session */
  logout(): void {
    clearSession();
    if (typeof window !== "undefined") {
      window.location.href = "/auth";
    }
  },
};
