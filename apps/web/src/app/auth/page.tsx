"use client";

import { Building2, KeyRound, LockKeyhole, Mail, Sparkles, UserRound } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { Button } from "@/components/ui/button";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api";

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
    const saved = window.localStorage.getItem("betflow-auth");
    if (saved) {
      router.replace("/dashboard");
    }
  }, [router]);

  const persistSession = (payload: { accessToken: string; tenant: unknown; user: unknown }) => {
    window.localStorage.setItem("betflow-auth", JSON.stringify(payload));
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
        throw new Error("Unable to create the tenant workspace.");
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
        throw new Error("Registration succeeded, but login failed.");
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
        throw new Error("Unable to sign in with those credentials.");
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

    
    <main className="min-h-screen bg-[#f6f7f9] px-4 py-8 text-zinc-950">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="flex flex-col justify-between rounded-lg border border-zinc-200 bg-zinc-950 p-6 text-white">
          <div>
            <Image
              src="/betflow-mark.svg"
              alt="BetFlow"
              width={44}
              height={44}
              className="rounded-lg"
              priority
            />
            <h1 className="mt-8 max-w-md text-4xl font-semibold tracking-tight">
              Tenant registration and secure access for BetFlow CRM.
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-6 text-zinc-300">
              Create the tenant workspace, configure the owner identity, and start from an RBAC-ready access model.
            </p>
          </div>
          <div className="mt-10 grid gap-3 text-sm text-zinc-300 sm:grid-cols-3">
            <span className="rounded-md border border-white/15 px-3 py-2">Workspace slug</span>
            <span className="rounded-md border border-white/15 px-3 py-2">Owner account</span>
            <span className="rounded-md border border-white/15 px-3 py-2">Audit baseline</span>
          </div>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-zinc-500">Access workspace</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">Sign in or create a tenant</h2>
            </div>
            <div className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-sm text-zinc-600">
              Demo ready
            </div>
          </div>

          <div className="mt-6 flex rounded-full border border-zinc-200 bg-zinc-50 p-1">
            <button
              type="button"
              className={`flex-1 rounded-full px-3 py-2 text-sm font-medium transition ${mode === "login" ? "bg-zinc-950 text-white" : "text-zinc-600"}`}
              onClick={() => setMode("login")}
            >
              Login
            </button>
            <button
              type="button"
              className={`flex-1 rounded-full px-3 py-2 text-sm font-medium transition ${mode === "register" ? "bg-zinc-950 text-white" : "text-zinc-600"}`}
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
                <span className="flex h-11 items-center gap-3 rounded-md border border-zinc-200 px-3">
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
                <span className="flex h-11 items-center gap-3 rounded-md border border-zinc-200 px-3">
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
                <span className="flex h-11 items-center gap-3 rounded-md border border-zinc-200 px-3">
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
              <Button className="mt-2 h-10" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          ) : (
            <form className="mt-6 grid gap-4" onSubmit={handleRegister}>
              <label className="grid gap-2 text-sm font-medium">
                Company name
                <span className="flex h-11 items-center gap-3 rounded-md border border-zinc-200 px-3">
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
                <span className="flex h-11 items-center gap-3 rounded-md border border-zinc-200 px-3">
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
                <span className="flex h-11 items-center gap-3 rounded-md border border-zinc-200 px-3">
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
                <span className="flex h-11 items-center gap-3 rounded-md border border-zinc-200 px-3">
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
                <span className="flex h-11 items-center gap-3 rounded-md border border-zinc-200 px-3">
                  <KeyRound className="size-4 text-zinc-500" />
                  <input
                    className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-400"
                    value={registerState.password}
                    onChange={(event) => setRegisterState((current) => ({ ...current, password: event.target.value }))}
                    placeholder="Minimum 12 characters"
                    type="password"
                    required
                  />
                </span>
              </label>
              <Button className="mt-2 h-10" disabled={loading}>
                {loading ? "Creating tenant..." : "Create tenant"}
              </Button>
            </form>
          )}

          <div className="mt-8 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-zinc-700">
              <Sparkles className="size-4" />
              Demo credentials
            </div>
            <ul className="mt-3 grid gap-2 text-sm text-zinc-600">
              <li>Use email admin@betflow.example, slug betflow-crm, and password admin123 to sign in immediately.</li>
              <li>New tenants are created and auto-logged into the dashboard after registration.</li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}
