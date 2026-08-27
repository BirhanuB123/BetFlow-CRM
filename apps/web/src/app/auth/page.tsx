"use client";

import { ArrowRight, UserPlus, LogIn, KeyRound, Lock, Building2 } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { clearSession, getSession } from "@/lib/api";
import { useBranding } from "@/lib/branding-context";
import { useTranslation } from "@/lib/i18n/language-context";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

type Mode = "login" | "register" | "forgot" | "reset" | "force_change_password";

type LoginState = {
  email: string;
  password: string;
};

type ForceChangeState = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
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

type ShowcasePhoto = {
  id: string;
  src: string;
  title: string;
  subtitle: string;
  location: string;
  statText: string;
};
const AUTH_SHOWCASE_PHOTOS: ShowcasePhoto[] = [
  {
    id: "bole-tower-1",
    src: "/tower.png",
    title: "Bole Luxury Towers",
    subtitle: "24-Story Residential & Commercial Elevation",
    location: "Addis Ababa",
    statText: "Selling Through · Live Stacking Locked",
  },
];

const labelClass = "text-[13px] font-semibold text-slate-700";
const inputClass =
  "mt-1.5 h-11 w-full rounded-xl bg-slate-50 border border-slate-200/90 px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20";

export default function AuthPage() {
  const router = useRouter();
  const { systemName } = useBranding();
  const { t } = useTranslation();
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

  const [forceChangeState, setForceChangeState] = useState<ForceChangeState>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
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
      .then(async (response) => {
        if (cancelled) return;
        if (response.ok) {
          const data = (await response.json()) as {
            user?: { mustChangePassword?: boolean };
          };
          if (data?.user?.mustChangePassword) {
            setMode("force_change_password");
            setFeedback(
              "Initial login: Please set a new secure password before accessing the workspace.",
            );
          } else {
            router.replace("/dashboard");
          }
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

      const resData = (await response.json()) as {
        accessToken: string;
        tenant: unknown;
        user: { mustChangePassword?: boolean };
      };

      persistSession(resData);

      if (resData?.user?.mustChangePassword) {
        setForceChangeState({
          currentPassword: loginState.password,
          newPassword: "",
          confirmPassword: "",
        });
        setMode("force_change_password");
        setFeedback(
          "Initial login detected: You must set a new personal password before accessing the system.",
        );
        return;
      }

      setFeedback("Signed in. Redirecting…");
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleForceChangePassword = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setFeedback(null);

    if (forceChangeState.newPassword !== forceChangeState.confirmPassword) {
      setError("New password and confirmation do not match.");
      setLoading(false);
      return;
    }

    const session = getSession();
    if (!session?.accessToken) {
      setError("Session expired. Please sign in again.");
      setMode("login");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({
          currentPassword: forceChangeState.currentPassword,
          newPassword: forceChangeState.newPassword,
        }),
      });

      if (!response.ok) {
        throw new Error(
          await readErrorMessage(
            response,
            "Failed to update password. Please check password criteria.",
          ),
        );
      }

      // Update stored session so user.mustChangePassword is false
      const store = remember ? window.localStorage : window.sessionStorage;
      const existing = getSession();
      if (existing && existing.user && typeof existing.user === "object") {
        store.setItem(
          "betflow-auth",
          JSON.stringify({
            ...existing,
            user: {
              ...(existing.user as Record<string, unknown>),
              mustChangePassword: false,
            },
          }),
        );
      }

      setFeedback("Password updated securely! Redirecting to workspace…");
      setTimeout(() => {
        router.push("/dashboard");
      }, 700);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Password update failed.");
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

  const activePhoto = AUTH_SHOWCASE_PHOTOS[0];

  return (
    <main className="relative min-h-screen w-full bg-slate-900 font-sans text-slate-100 selection:bg-primary selection:text-white">
      <div className="grid min-h-screen w-full lg:grid-cols-12">
        {/* Left Panel: Real-Estate Showcase (Hidden on small screens) */}
        <div className="relative hidden lg:flex lg:col-span-7 xl:col-span-7 flex-col justify-between overflow-hidden bg-slate-950 p-12">
          {/* Real Estate Background Photo */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-700 opacity-60"
            style={{ backgroundImage: `url(${activePhoto.src})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/20" />

          {/* Top Brand Tag */}
          <div className="relative z-10 flex items-center gap-3">
            <Image
              src="/betflow-mark.svg"
              alt={systemName}
              width={36}
              height={36}
              className="rounded-xl bg-primary p-1 shadow-md"
            />
            <div>
              <p className="text-sm font-black text-white tracking-tight">
                {systemName}
              </p>
              <p className="text-xs text-slate-400 font-medium">
                {t("auth.systemSubtitle")}
              </p>
            </div>
          </div>

          {/* Floating Caption Badge & Headline Showcase */}
          <div className="relative z-10 space-y-6">
            {/* Floating Hero Property Badge */}
            <div className="rounded-2xl border border-white/20 bg-slate-900/85 p-5 backdrop-blur-md shadow-2xl max-w-md space-y-3">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-primary/20 px-2.5 py-0.5 text-[10px] font-extrabold text-primary/80 border border-primary/30 uppercase tracking-wider">
                  {t("auth.featuredDevelopment")}
                </span>
                <span className="text-[11px] font-extrabold text-slate-400">
                  📍 {activePhoto.location}
                </span>
              </div>
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-primary/30 border border-primary/30 p-2.5 text-primary/80 mt-0.5">
                  <Building2 className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    {activePhoto.title}
                  </h3>
                  <p className="text-xs font-medium text-slate-300 mt-0.5">
                    {activePhoto.subtitle}
                  </p>
                </div>
              </div>
              <div className="pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-success font-extrabold flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-success animate-pulse" />
                  {t("auth.statText")}
                </span>
              </div>
            </div>

            <div className="max-w-xl space-y-2">
              <h2 className="text-2xl font-black tracking-tight text-white leading-tight">
                {t("auth.heroHeadline")}
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                {t("auth.heroSubheadline")}
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel: Auth Form Container */}
        <div className="flex flex-col justify-between p-6 sm:p-10 lg:col-span-5 xl:col-span-5 lg:p-12 bg-white text-slate-900 min-h-screen">
          <div className="mx-auto w-full max-w-md my-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col items-center text-center">
              <Image
                src="/betflow-logo.svg"
                alt={systemName}
                width={168}
                height={44}
                priority
                className="h-11 w-auto"
              />
              <h1 className="mt-3 text-lg font-extrabold text-slate-800 tracking-tight">
                {systemName}
              </h1>
              <p className="mt-0.5 text-xs font-medium tracking-wide text-zinc-500">
                {t("auth.portalAccess")}
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 rounded-xl bg-[#f1f4f8] p-1 text-xs font-medium text-zinc-600">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError(null);
                  setFeedback(null);
                }}
                className={`flex items-center justify-center gap-1.5 rounded-lg py-2 transition ${
                  mode === "login"
                    ? "bg-white font-bold text-primary shadow-sm"
                    : "hover:text-zinc-900"
                }`}
              >
                <LogIn className="size-3.5" />
                {t("auth.signIn")}
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
                    ? "bg-white font-bold text-primary shadow-sm"
                    : "hover:text-zinc-900"
                }`}
              >
                <UserPlus className="size-3.5" />
                {t("auth.register")}
              </button>
            </div>

            {error ? (
              <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            ) : feedback ? (
              <p className="mt-4 rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
                {feedback}
              </p>
            ) : null}

            {mode === "login" ? (
              <form className="mt-5 grid gap-4" onSubmit={handleLogin}>
                <label className="block">
                  <span className={labelClass}>{t("auth.email")}</span>
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
                  <span className={labelClass}>{t("auth.password")}</span>
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
                      className="size-4 rounded border-zinc-300 accent-primary"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                    />
                    {t("auth.rememberMe")}
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      setMode("forgot");
                      setError(null);
                      setFeedback(null);
                      setForgotState({ email: loginState.email });
                    }}
                    className="text-xs font-medium text-primary hover:text-primary/90 hover:underline"
                  >
                    {t("auth.forgotPasswordLink")}
                  </button>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-white transition hover:bg-primary/90 disabled:opacity-60 cursor-pointer shadow-sm"
                  >
                    {loading ? t("auth.signingIn") : t("auth.signInBtn")}
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
                    className="font-medium text-primary hover:text-primary/90 hover:underline"
                  >
                    Register here
                  </button>
                </p>
              </form>
            ) : mode === "register" ? (
              <form className="mt-5 grid gap-3.5" onSubmit={handleRegister}>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className={labelClass}>{t("auth.firstName")}</span>
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
                    <span className={labelClass}>{t("auth.lastName")}</span>
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
                  <span className={labelClass}>{t("auth.email")}</span>
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
                  <span className={labelClass}>{t("auth.password")}</span>
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
                  <span className={labelClass}>{t("auth.inviteCode")}</span>
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
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-white transition hover:bg-primary/90 disabled:opacity-60 cursor-pointer shadow-sm"
                  >
                    {loading ? t("auth.registering") : t("auth.registerBtn")}
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
                    className="font-medium text-primary hover:text-primary/90 hover:underline"
                  >
                    {t("auth.signIn")}
                  </button>
                </p>
              </form>
            ) : mode === "forgot" ? (
              <form className="mt-5 grid gap-4" onSubmit={handleForgotPassword}>
                <div className="rounded-xl bg-primary/10 border border-primary/20 p-3.5 text-xs text-primary">
                  <p className="font-bold flex items-center gap-1.5 text-primary">
                    <KeyRound className="size-4" /> {t("auth.forgotPassword")}
                  </p>
                  <p className="mt-1 text-zinc-600 font-medium">
                    Enter your account email address below to generate a 6-digit password verification code.
                  </p>
                </div>

                <label className="block">
                  <span className={labelClass}>{t("auth.email")}</span>
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
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-white transition hover:bg-primary/90 disabled:opacity-60 cursor-pointer shadow-sm"
                >
                  {loading ? t("auth.signingIn") : t("auth.forgotBtn")}
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
                    className="font-medium text-primary hover:text-primary/90 hover:underline"
                  >
                    {t("auth.backToSignIn")}
                  </button>
                </p>
              </form>
            ) : mode === "force_change_password" ? (
              <form className="mt-5 grid gap-4" onSubmit={handleForceChangePassword}>
                <div className="rounded-xl bg-amber-500/10 p-3.5 text-xs text-amber-600 border border-amber-500/20">
                  <p className="font-bold flex items-center gap-1.5 text-amber-700">
                    <Lock className="size-4" /> {t("auth.forceChangePassword")}
                  </p>
                  <p className="mt-1 text-slate-600 font-medium">
                    {t("auth.changePasswordPrompt")}
                  </p>
                </div>

                <label className="block">
                  <span className={labelClass}>{t("auth.currentPassword")}</span>
                  <input
                    className={inputClass}
                    type="password"
                    placeholder="••••••••"
                    value={forceChangeState.currentPassword}
                    onChange={(e) =>
                      setForceChangeState((s) => ({
                        ...s,
                        currentPassword: e.target.value,
                      }))
                    }
                    required
                  />
                </label>

                <label className="block">
                  <span className={labelClass}>{t("auth.newPassword")}</span>
                  <input
                    className={inputClass}
                    type="password"
                    placeholder="••••••••"
                    value={forceChangeState.newPassword}
                    onChange={(e) =>
                      setForceChangeState((s) => ({
                        ...s,
                        newPassword: e.target.value,
                      }))
                    }
                    required
                  />
                  <span className="mt-1 block text-[10px] text-zinc-400 font-medium">
                    Must be at least 8 characters with upper, lowercase, and a number or symbol.
                  </span>
                </label>

                <label className="block">
                  <span className={labelClass}>{t("auth.confirmPassword")}</span>
                  <input
                    className={inputClass}
                    type="password"
                    placeholder="••••••••"
                    value={forceChangeState.confirmPassword}
                    onChange={(e) =>
                      setForceChangeState((s) => ({
                        ...s,
                        confirmPassword: e.target.value,
                      }))
                    }
                    required
                  />
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-white transition hover:bg-primary/90 disabled:opacity-60 cursor-pointer shadow-sm"
                >
                  {loading ? t("auth.signingIn") : t("auth.changePasswordBtn")}
                  {!loading && <ArrowRight className="size-4" />}
                </button>

                <p className="pt-2 text-center text-[13px] text-zinc-500">
                  <button
                    type="button"
                    onClick={() => {
                      clearSession();
                      setMode("login");
                      setError(null);
                      setFeedback(null);
                    }}
                    className="font-medium text-primary hover:text-primary/90 hover:underline"
                  >
                    {t("auth.backToSignIn")}
                  </button>
                </p>
              </form>
            ) : (
              <form className="mt-5 grid gap-4" onSubmit={handleResetPassword}>
                <div className="rounded-xl bg-warning/10 p-3.5 text-xs text-warning border border-warning/20">
                  <p className="font-semibold flex items-center gap-1.5 text-warning">
                    <Lock className="size-4" /> {t("auth.resetPassword")}
                  </p>
                  <p className="mt-1 text-warning">
                    Enter the 6-digit code sent to your email along with your new password.
                  </p>
                </div>

                <label className="block">
                  <span className={labelClass}>{t("auth.email")}</span>
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
                  <span className={labelClass}>{t("auth.resetToken")}</span>
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
                  <span className={labelClass}>{t("auth.newPassword")}</span>
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
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-white transition hover:bg-primary/90 disabled:opacity-60 cursor-pointer shadow-sm"
                >
                  {loading ? t("auth.signingIn") : t("auth.resetBtn")}
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
                    className="font-medium text-primary hover:text-primary/90 hover:underline"
                  >
                    {t("auth.backToSignIn")}
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

          <footer className="flex justify-center gap-6 pt-6 text-xs text-zinc-400">
            <a href="#" className="hover:text-zinc-700 transition-colors">
              Internal Use Only
            </a>
            <span>•</span>
            <a href="#" className="hover:text-zinc-700 transition-colors">
              Privacy Policy
            </a>
          </footer>
        </div>
      </div>
    </main>
  );
}
