"use client";

import { ArrowRight, UserPlus, LogIn, KeyRound, Lock } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { clearSession, getSession } from "@/lib/api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

type Mode = "login" | "register" | "forgot" | "reset";

type LoginState = {
  email: string;
  password: string;
};

type RegisterState = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  inviteCode: string;
};

type ForgotState = {
  email: string;
};

type ResetState = {
  email: string;
  token: string;
  newPassword: string;
};

const labelClass = "text-[13px] font-medium text-zinc-600";
const inputClass =
  "mt-1.5 h-11 w-full rounded-lg bg-[#f1f4f8] px-3.5 text-sm text-zinc-900 outline-none ring-1 ring-transparent transition placeholder:text-zinc-400 focus:bg-white focus:ring-2 focus:ring-[#0E6E63]/40";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [remember, setRemember] = useState(true);

  const [loginState, setLoginState] = useState<LoginState>({
    email: "",
    password: "",
  });

  const [registerState, setRegisterState] = useState<RegisterState>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    inviteCode: "",
  });

  const [forgotState, setForgotState] = useState<ForgotState>({
    email: "",
  });

  const [resetState, setResetState] = useState<ResetState>({
    email: "",
    token: "",
    newPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const session = getSession();
    if (!session?.accessToken) {
      clearSession();
      return;
    }

    let cancelled = false;
    fetch(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    })
      .then((response) => {
        if (cancelled) return;
        if (response.ok) {
          router.replace("/dashboard");
        } else {
          clearSession();
        }
      })
      .catch(() => {
        // API unreachable: keep the session, stay on the form.
      });

    return () => {
      cancelled = true;
    };
  }, [router]);

  const persistSession = (payload: {
    accessToken: string;
    tenant: unknown;
    user: unknown;
  }) => {
    const store = remember ? window.localStorage : window.sessionStorage;
    const other = remember ? window.sessionStorage : window.localStorage;
    store.setItem("betflow-auth", JSON.stringify(payload));
    other.removeItem("betflow-auth");
  };

  const readErrorMessage = async (response: Response, fallback: string) => {
    try {
      const body = (await response.json()) as { message?: string | string[] };
      if (Array.isArray(body.message)) return body.message.join(", ");
      return body.message || fallback;
    } catch {
      return fallback;
    }
  };

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setFeedback(null);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginState),
      });

      if (!response.ok) {
        throw new Error(
          await readErrorMessage(
            response,
            "Unable to sign in with those credentials.",
          ),
        );
      }

      persistSession(await response.json());
      setFeedback("Signed in. Redirecting…");
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setFeedback(null);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...registerState,
          inviteCode: registerState.inviteCode.trim() || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(
          await readErrorMessage(response, "Unable to register account."),
        );
      }

      const resData = (await response.json()) as {
        requiresApproval?: boolean;
        message?: string;
      };

      if (resData.requiresApproval) {
        setFeedback(
          resData.message ||
            "Registration successful! Your account is pending manager approval before you can sign in.",
        );
        setMode("login");
        setLoginState({
          email: registerState.email,
          password: registerState.password,
        });
        return;
      }

      // Automatically sign in if auto-approved via Invite Code
      const loginRes = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: registerState.email,
          password: registerState.password,
        }),
      });

      if (loginRes.ok) {
        persistSession(await loginRes.json());
        setFeedback("Account activated! Redirecting to dashboard…");
        router.push("/dashboard");
      } else {
        setFeedback("Account registered! Please sign in.");
        setMode("login");
        setLoginState({
          email: registerState.email,
          password: registerState.password,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setFeedback(null);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(forgotState),
      });

      if (!response.ok) {
        throw new Error(
          await readErrorMessage(
            response,
            "Unable to process password reset request.",
          ),
        );
      }

      const resData = (await response.json()) as {
        message?: string;
        resetToken?: string;
      };

      setResetState((prev) => ({
        ...prev,
        email: forgotState.email,
        token: resData.resetToken || prev.token,
      }));

      setFeedback(
        resData.message ||
          "Reset code generated! Please enter your code below.",
      );
      setMode("reset");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setFeedback(null);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resetState),
      });

      if (!response.ok) {
        throw new Error(
          await readErrorMessage(
            response,
            "Unable to reset password. Please check your reset code.",
          ),
        );
      }

      const resData = (await response.json()) as { message?: string };
      setFeedback(
        resData.message ||
          "Password reset successfully! You can now sign in with your new password.",
      );
      setLoginState((prev) => ({
        ...prev,
        email: resetState.email,
        password: "",
      }));
      setMode("login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Password reset failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[#e9edf2]">
      {/* Background */}
      <div className="absolute inset-0 bg-[url('/login-bg.svg')] bg-cover bg-center" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#eef2f6]/70 via-transparent to-transparent" />

      {/* Floating auth card */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 sm:px-10 lg:justify-start lg:px-24">
        <div className="w-full max-w-[420px] rounded-2xl border border-white/60 bg-white/95 p-8 shadow-[0_24px_60px_-24px_rgba(15,32,60,0.45)] backdrop-blur">
          <div className="flex flex-col items-center">
            <Image
              src="/betflow-logo.svg"
              alt="BetFlow"
              width={168}
              height={44}
              priority
              className="h-11 w-auto"
            />
            <p className="mt-2 text-[13px] font-medium tracking-wide text-zinc-400">
              Corporate CRM Portal
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="mt-6 grid grid-cols-2 rounded-xl bg-[#f1f4f8] p-1 text-xs font-medium text-zinc-600">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError(null);
                setFeedback(null);
              }}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-2 transition ${
                mode === "login"
                  ? "bg-white font-semibold text-[#0E6E63] shadow-sm"
                  : "hover:text-zinc-900"
              }`}
            >
              <LogIn className="size-3.5" />
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setError(null);
                setFeedback(null);
              }}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-2 transition ${
                mode === "register"
                  ? "bg-white font-semibold text-[#0E6E63] shadow-sm"
                  : "hover:text-zinc-900"
              }`}
            >
              <UserPlus className="size-3.5" />
              Register
            </button>
          </div>

          {error ? (
            <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">
              {error}
            </p>
          ) : feedback ? (
            <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-600">
              {feedback}
            </p>
          ) : null}

          {mode === "login" ? (
            <form className="mt-5 grid gap-4" onSubmit={handleLogin}>
              <label className="block">
                <span className={labelClass}>Email</span>
                <input
                  className={inputClass}
                  type="email"
                  autoComplete="email"
                  placeholder="you@betflow.com"
                  value={loginState.email}
                  onChange={(e) =>
                    setLoginState((s) => ({ ...s, email: e.target.value }))
                  }
                  required
                />
              </label>
              <label className="block">
                <span className={labelClass}>Password</span>
                <input
                  className={inputClass}
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={loginState.password}
                  onChange={(e) =>
                    setLoginState((s) => ({ ...s, password: e.target.value }))
                  }
                  required
                />
              </label>

              <div className="flex items-center justify-between pt-1">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-600">
                  <input
                    type="checkbox"
                    className="size-4 rounded border-zinc-300 accent-[#0E6E63]"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  Remember me
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setMode("forgot");
                    setError(null);
                    setFeedback(null);
                    setForgotState({ email: loginState.email });
                  }}
                  className="text-xs font-medium text-[#0E6E63] hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#0E6E63] px-4 text-sm font-medium text-white transition hover:bg-[#0b5c52] disabled:opacity-60"
                >
                  {loading ? "Signing in…" : "Sign in"}
                  {!loading && <ArrowRight className="size-4" />}
                </button>
              </div>

              <p className="pt-2 text-center text-[13px] text-zinc-500">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("register");
                    setError(null);
                    setFeedback(null);
                  }}
                  className="font-medium text-[#0E6E63] hover:underline"
                >
                  Register here
                </button>
              </p>
            </form>
          ) : mode === "register" ? (
            <form className="mt-5 grid gap-3.5" onSubmit={handleRegister}>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className={labelClass}>First Name</span>
                  <input
                    className={inputClass}
                    type="text"
                    placeholder="John"
                    value={registerState.firstName}
                    onChange={(e) =>
                      setRegisterState((s) => ({
                        ...s,
                        firstName: e.target.value,
                      }))
                    }
                    required
                  />
                </label>
                <label className="block">
                  <span className={labelClass}>Last Name</span>
                  <input
                    className={inputClass}
                    type="text"
                    placeholder="Doe"
                    value={registerState.lastName}
                    onChange={(e) =>
                      setRegisterState((s) => ({
                        ...s,
                        lastName: e.target.value,
                      }))
                    }
                    required
                  />
                </label>
              </div>

              <label className="block">
                <span className={labelClass}>Email</span>
                <input
                  className={inputClass}
                  type="email"
                  autoComplete="email"
                  placeholder="you@betflow.com"
                  value={registerState.email}
                  onChange={(e) =>
                    setRegisterState((s) => ({ ...s, email: e.target.value }))
                  }
                  required
                />
              </label>

              <label className="block">
                <span className={labelClass}>Password</span>
                <input
                  className={inputClass}
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={registerState.password}
                  onChange={(e) =>
                    setRegisterState((s) => ({
                      ...s,
                      password: e.target.value,
                    }))
                  }
                  required
                />
              </label>

              <label className="block">
                <span className={labelClass}>Admin Invite Code (Optional)</span>
                <input
                  className={inputClass}
                  type="text"
                  placeholder="e.g. BETFLOW-VIP-2026 for auto-activation"
                  value={registerState.inviteCode}
                  onChange={(e) =>
                    setRegisterState((s) => ({
                      ...s,
                      inviteCode: e.target.value,
                    }))
                  }
                />
                <span className="mt-1 block text-[10px] text-zinc-400 font-medium">
                  Without a valid invite code, your account will require manager approval before you can sign in.
                </span>
              </label>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#0E6E63] px-4 text-sm font-medium text-white transition hover:bg-[#0b5c52] disabled:opacity-60"
                >
                  {loading ? "Creating account…" : "Create Account"}
                  {!loading && <ArrowRight className="size-4" />}
                </button>
              </div>

              <p className="pt-2 text-center text-[13px] text-zinc-500">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError(null);
                    setFeedback(null);
                  }}
                  className="font-medium text-[#0E6E63] hover:underline"
                >
                  Sign in
                </button>
              </p>
            </form>
          ) : mode === "forgot" ? (
            <form className="mt-5 grid gap-4" onSubmit={handleForgotPassword}>
              <div className="rounded-xl bg-[#0E6E63]/10 p-3.5 text-xs text-[#0E6E63]">
                <p className="font-semibold flex items-center gap-1.5">
                  <KeyRound className="size-4" /> Forgot your password?
                </p>
                <p className="mt-1 text-zinc-600">
                  Enter your account email address below to generate a 6-digit password verification code.
                </p>
              </div>

              <label className="block">
                <span className={labelClass}>Registered Email</span>
                <input
                  className={inputClass}
                  type="email"
                  placeholder="you@betflow.com"
                  value={forgotState.email}
                  onChange={(e) => setForgotState({ email: e.target.value })}
                  required
                />
              </label>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#0E6E63] px-4 text-sm font-medium text-white transition hover:bg-[#0b5c52] disabled:opacity-60"
              >
                {loading ? "Requesting code…" : "Send Verification Code"}
                {!loading && <ArrowRight className="size-4" />}
              </button>

              <p className="pt-2 text-center text-[13px] text-zinc-500">
                Remember your password?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError(null);
                    setFeedback(null);
                  }}
                  className="font-medium text-[#0E6E63] hover:underline"
                >
                  Back to Sign in
                </button>
              </p>
            </form>
          ) : (
            <form className="mt-5 grid gap-4" onSubmit={handleResetPassword}>
              <div className="rounded-xl bg-amber-50 p-3.5 text-xs text-amber-900 border border-amber-200">
                <p className="font-semibold flex items-center gap-1.5 text-amber-800">
                  <Lock className="size-4" /> Reset Password Verification
                </p>
                <p className="mt-1 text-amber-700">
                  Enter the 6-digit code sent to your email along with your new password.
                </p>
              </div>

              <label className="block">
                <span className={labelClass}>Account Email</span>
                <input
                  className={inputClass}
                  type="email"
                  placeholder="you@betflow.com"
                  value={resetState.email}
                  onChange={(e) =>
                    setResetState((s) => ({ ...s, email: e.target.value }))
                  }
                  required
                />
              </label>

              <label className="block">
                <span className={labelClass}>6-Digit Verification Code</span>
                <input
                  className={inputClass}
                  type="text"
                  placeholder="e.g. 849201"
                  value={resetState.token}
                  onChange={(e) =>
                    setResetState((s) => ({ ...s, token: e.target.value }))
                  }
                  required
                />
              </label>

              <label className="block">
                <span className={labelClass}>New Password</span>
                <input
                  className={inputClass}
                  type="password"
                  placeholder="••••••••"
                  value={resetState.newPassword}
                  onChange={(e) =>
                    setResetState((s) => ({ ...s, newPassword: e.target.value }))
                  }
                  required
                />
                <span className="mt-1 block text-[10px] text-zinc-400">
                  Must be at least 8 characters with uppercase, lowercase, and a number or symbol.
                </span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#0E6E63] px-4 text-sm font-medium text-white transition hover:bg-[#0b5c52] disabled:opacity-60"
              >
                {loading ? "Resetting password…" : "Reset Password & Sign In"}
                {!loading && <ArrowRight className="size-4" />}
              </button>

              <p className="pt-2 text-center text-[13px] text-zinc-500">
                Cancel reset?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError(null);
                    setFeedback(null);
                  }}
                  className="font-medium text-[#0E6E63] hover:underline"
                >
                  Back to Sign in
                </button>
              </p>
            </form>
          )}

          <p className="mt-6 border-t border-zinc-100 pt-4 text-center text-xs text-zinc-400">
            <a
              href="https://www.gebetatech.com"
              className="hover:text-zinc-700"
            >
              Developed By: Gebeta Trading Technology
            </a>
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute inset-x-0 bottom-0 z-10 flex justify-center gap-6 pb-5 text-xs text-zinc-500">
        <a href="#" className="hover:text-zinc-700">
          Internal Use Only
        </a>
        <a href="#" className="hover:text-zinc-700">
          Privacy Policy
        </a>
      </footer>
    </main>
  );
}
