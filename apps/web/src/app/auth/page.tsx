"use client";

import { Building2, CheckCircle2, KeyRound, LockKeyhole, Mail, Sparkles, UserRound } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { clearSession, getSession } from "@/lib/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

const highlights = [
  "Lead capture, qualification & assignment",
  "Deal pipeline with revenue forecasting",
  "Payments, contracts & a full audit trail",
];

type AuthMode = "register" | "login";

type RegisterState = {
  companyName: string;
  slug: string;
  ownerName: string;
  ownerEmail: string;
  password: string;
};

type LoginState = {
  email: string;
  tenantSlug: string;
  password: string;
};

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [registerState, setRegisterState] = useState<RegisterState>({
    companyName: "",
    slug: "",
    ownerName: "",
    ownerEmail: "",
    password: "",
  });
  const [loginState, setLoginState] = useState<LoginState>({
    email: "admin@betflow.example",
    tenantSlug: "betflow-crm",
    password: "admin123",
  });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only redirect if the saved session is still valid; otherwise clear it
    // so the login/register forms stay reachable after token expiry.
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

  const persistSession = (payload: { accessToken: string; tenant: unknown; user: unknown }) => {
    window.localStorage.setItem("betflow-auth", JSON.stringify(payload));
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

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setFeedback(null);

    try {
      const registerResponse = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: registerState.companyName,
          slug: registerState.slug,
          ownerName: registerState.ownerName,
          ownerEmail: registerState.ownerEmail,
          password: registerState.password,
          region: "US East",
          plan: "Starter",
        }),
      });

      if (!registerResponse.ok) {
        throw new Error(
          await readErrorMessage(registerResponse, "Unable to create the tenant workspace."),
        );
      }

      const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: registerState.ownerEmail,
          password: registerState.password,
          tenantSlug: registerState.slug,
        }),
      });

      if (!loginResponse.ok) {
        throw new Error(
          await readErrorMessage(loginResponse, "Registration succeeded, but login failed."),
        );
      }

      const session = await loginResponse.json();
      persistSession(session);
      setFeedback("Workspace created. Redirecting to the dashboard...");
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
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
          await readErrorMessage(response, "Unable to sign in with those credentials."),
        );
      }

      const session = await response.json();
      persistSession(session);
      setFeedback("Signed in. Redirecting to the dashboard...");
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#eef2f3] px-4 py-10 text-zinc-950">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_55%_at_12%_8%,rgba(14,110,99,0.14),transparent_60%),radial-gradient(45%_45%_at_100%_100%,rgba(14,110,99,0.12),transparent_55%)]" />

      <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-[0_24px_60px_-24px_rgba(15,32,60,0.35)]">
        <div className="grid lg:grid-cols-2">
          <section className="relative hidden flex-col justify-between bg-gradient-to-br from-[#0E6E63] to-[#083f39] p-8 text-white lg:flex">
            <div>
              <div className="flex items-center gap-3">
                <Image
                  src="/betflow-mark.svg"
                  alt="BetFlow"
                  width={40}
                  height={40}
                  className="rounded-lg ring-1 ring-white/25"
                  priority
                />
                <span className="text-lg font-semibold">BetFlow CRM</span>
              </div>
              <h1 className="mt-10 text-3xl font-semibold leading-tight tracking-tight">
                Run your entire real-estate pipeline from one workspace.
              </h1>
              <p className="mt-4 max-w-sm text-sm leading-6 text-white/80">
                Tenant-scoped access with an RBAC-ready model for sales, finance, and admin teams.
              </p>
              <ul className="mt-8 space-y-3.5 text-sm text-white/90">
                {highlights.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-white/85" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-10 text-xs text-white/55">© 2026 BetFlow CRM · Multi-tenant real estate platform</p>
          </section>

          <section className="p-6 sm:p-8">
            <div className="mb-6 flex items-center gap-3 lg:hidden">
              <Image src="/betflow-mark.svg" alt="BetFlow" width={36} height={36} className="rounded-lg" priority />
              <span className="text-base font-semibold">BetFlow CRM</span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-[#0E6E63]">Access workspace</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight">Sign in or create a tenant</h2>
              </div>
              <div className="hidden rounded-full border border-[#0E6E63]/20 bg-[#0E6E63]/10 px-3 py-1 text-xs font-medium text-[#0b5c52] sm:block">
                Demo ready
              </div>
            </div>

          <div className="mt-6 flex rounded-full border border-zinc-200 bg-zinc-100 p-1">
            <button
              type="button"
              className={`flex-1 rounded-full px-3 py-2 text-sm font-medium transition ${mode === "login" ? "bg-[#0E6E63] text-white shadow-sm" : "text-zinc-600 hover:text-zinc-900"}`}
              onClick={() => setMode("login")}
            >
              Login
            </button>
            <button
              type="button"
              className={`flex-1 rounded-full px-3 py-2 text-sm font-medium transition ${mode === "register" ? "bg-[#0E6E63] text-white shadow-sm" : "text-zinc-600 hover:text-zinc-900"}`}
              onClick={() => setMode("register")}
            >
              Register
            </button>
          </div>

          {feedback ? <p className="mt-4 text-sm text-emerald-600">{feedback}</p> : null}
          {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}

          {mode === "login" ? (
            <form className="mt-6 grid gap-4" onSubmit={handleLogin}>
              <label className="grid gap-2 text-sm font-medium">
                Email
                <span className="flex h-11 items-center gap-3 rounded-md border border-zinc-200 bg-white px-3 transition focus-within:border-[#0E6E63] focus-within:ring-2 focus-within:ring-[#0E6E63]/15">
                  <Mail className="size-4 text-zinc-500" />
                  <input
                    className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-400"
                    value={loginState.email}
                    onChange={(event) => setLoginState((current) => ({ ...current, email: event.target.value }))}
                    placeholder="owner@company.com"
                    type="email"
                    required
                  />
                </span>
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Workspace slug
                <span className="flex h-11 items-center gap-3 rounded-md border border-zinc-200 bg-white px-3 transition focus-within:border-[#0E6E63] focus-within:ring-2 focus-within:ring-[#0E6E63]/15">
                  <LockKeyhole className="size-4 text-zinc-500" />
                  <input
                    className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-400"
                    value={loginState.tenantSlug}
                    onChange={(event) => setLoginState((current) => ({ ...current, tenantSlug: event.target.value }))}
                    placeholder="betflow-realty"
                    required
                  />
                </span>
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Password
                <span className="flex h-11 items-center gap-3 rounded-md border border-zinc-200 bg-white px-3 transition focus-within:border-[#0E6E63] focus-within:ring-2 focus-within:ring-[#0E6E63]/15">
                  <KeyRound className="size-4 text-zinc-500" />
                  <input
                    className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-400"
                    value={loginState.password}
                    onChange={(event) => setLoginState((current) => ({ ...current, password: event.target.value }))}
                    placeholder="Your workspace password"
                    type="password"
                    required
                  />
                </span>
              </label>
              <Button type="submit" className="mt-2 h-10 bg-[#0E6E63] text-white hover:bg-[#0b5c52]" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          ) : (
            <form className="mt-6 grid gap-4" onSubmit={handleRegister}>
              <label className="grid gap-2 text-sm font-medium">
                Company name
                <span className="flex h-11 items-center gap-3 rounded-md border border-zinc-200 bg-white px-3 transition focus-within:border-[#0E6E63] focus-within:ring-2 focus-within:ring-[#0E6E63]/15">
                  <Building2 className="size-4 text-zinc-500" />
                  <input
                    className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-400"
                    value={registerState.companyName}
                    onChange={(event) => setRegisterState((current) => ({ ...current, companyName: event.target.value }))}
                    placeholder="BetFlow Realty"
                    required
                  />
                </span>
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Workspace slug
                <span className="flex h-11 items-center gap-3 rounded-md border border-zinc-200 bg-white px-3 transition focus-within:border-[#0E6E63] focus-within:ring-2 focus-within:ring-[#0E6E63]/15">
                  <LockKeyhole className="size-4 text-zinc-500" />
                  <input
                    className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-400"
                    value={registerState.slug}
                    onChange={(event) => setRegisterState((current) => ({ ...current, slug: event.target.value }))}
                    placeholder="betflow-realty"
                    required
                  />
                </span>
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Owner name
                <span className="flex h-11 items-center gap-3 rounded-md border border-zinc-200 bg-white px-3 transition focus-within:border-[#0E6E63] focus-within:ring-2 focus-within:ring-[#0E6E63]/15">
                  <UserRound className="size-4 text-zinc-500" />
                  <input
                    className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-400"
                    value={registerState.ownerName}
                    onChange={(event) => setRegisterState((current) => ({ ...current, ownerName: event.target.value }))}
                    placeholder="Maya Johnson"
                    required
                  />
                </span>
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Owner email
                <span className="flex h-11 items-center gap-3 rounded-md border border-zinc-200 bg-white px-3 transition focus-within:border-[#0E6E63] focus-within:ring-2 focus-within:ring-[#0E6E63]/15">
                  <Mail className="size-4 text-zinc-500" />
                  <input
                    className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-400"
                    value={registerState.ownerEmail}
                    onChange={(event) => setRegisterState((current) => ({ ...current, ownerEmail: event.target.value }))}
                    placeholder="owner@company.com"
                    type="email"
                    required
                  />
                </span>
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Password
                <span className="flex h-11 items-center gap-3 rounded-md border border-zinc-200 bg-white px-3 transition focus-within:border-[#0E6E63] focus-within:ring-2 focus-within:ring-[#0E6E63]/15">
                  <KeyRound className="size-4 text-zinc-500" />
                  <input
                    className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-400"
                    value={registerState.password}
                    onChange={(event) => setRegisterState((current) => ({ ...current, password: event.target.value }))}
                    placeholder="Minimum 8 characters"
                    type="password"
                    required
                  />
                </span>
              </label>
              <Button type="submit" className="mt-2 h-10 bg-[#0E6E63] text-white hover:bg-[#0b5c52]" disabled={loading}>
                {loading ? "Creating tenant..." : "Create tenant"}
              </Button>
            </form>
          )}

            <div className="mt-8 rounded-lg border border-[#0E6E63]/15 bg-[#0E6E63]/[0.06] p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#0b5c52]">
                <Sparkles className="size-4" />
                Demo credentials
              </div>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                Email <span className="font-medium text-zinc-800">admin@betflow.example</span>, slug{" "}
                <span className="font-medium text-zinc-800">betflow-crm</span>, password{" "}
                <span className="font-medium text-zinc-800">admin123</span>. New tenants are auto-logged in after
                registration.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
