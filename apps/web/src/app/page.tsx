import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Building2, ChartNoAxesCombined, ShieldCheck, Workflow } from "lucide-react";

import { demoCredentials, landingMetrics, launchChecklist } from "@/features/go-to-market/go-to-market-data";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f6f7f9] text-zinc-950">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/betflow-mark.svg"
              alt="BetFlow"
              width={36}
              height={36}
              className="rounded-lg"
              priority
            />
            <span className="text-sm font-semibold">BetFlow CRM</span>
          </Link>
          <nav className="hidden items-center gap-5 text-sm font-medium text-zinc-600 md:flex">
            <Link href="/pricing" className="hover:text-zinc-950">Pricing</Link>
            <Link href="/guides/user" className="hover:text-zinc-950">User guide</Link>
            <Link href="/support" className="hover:text-zinc-950">Support</Link>
          </nav>
          <Link href="/auth" className="rounded-md bg-zinc-950 px-3 py-2 text-sm font-medium text-white">
            Open demo
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:py-14">
        <div className="flex flex-col justify-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Multi-tenant real estate CRM</p>
          <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Run leads, inventory, sales, contracts, payments, and SaaS tenants from one CRM.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-zinc-600">
            BetFlow CRM gives real estate operators a tenant-scoped workspace for sales teams, finance teams, admins,
            and customer-facing workflows.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link href="/auth" className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-zinc-950 px-4 text-sm font-medium text-white">
              Try seeded demo
              <ArrowRight className="size-4" />
            </Link>
            <Link href="/pricing" className="inline-flex h-10 items-center justify-center rounded-md border border-zinc-300 bg-white px-4 text-sm font-medium">
              View pricing
            </Link>
          </div>
          <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
            Demo login: {demoCredentials.email} / {demoCredentials.password} / tenant {demoCredentials.tenant}
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="rounded-md bg-zinc-950 p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-300">Live sales command center</p>
                <p className="mt-1 text-2xl font-semibold">$8.4M forecast</p>
              </div>
              <ChartNoAxesCombined className="size-8 text-emerald-300" />
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {["Website leads", "Meta import", "WhatsApp follow-up"].map((label) => (
                <div key={label} className="rounded-md border border-white/15 p-3">
                  <p className="text-xs text-zinc-400">{label}</p>
                  <p className="mt-2 text-lg font-semibold">Live</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-md border border-zinc-200 p-4">
              <Building2 className="size-5 text-zinc-600" />
              <p className="mt-3 text-sm font-semibold">Inventory visibility</p>
              <p className="mt-1 text-sm text-zinc-500">Projects, buildings, floors, unit status, availability, and media.</p>
            </div>
            <div className="rounded-md border border-zinc-200 p-4">
              <Workflow className="size-5 text-zinc-600" />
              <p className="mt-3 text-sm font-semibold">Sales workflow</p>
              <p className="mt-1 text-sm text-zinc-500">Site visits, reservations, schedules, receipts, approvals, and contracts.</p>
            </div>
            <div className="rounded-md border border-zinc-200 p-4 md:col-span-2">
              <ShieldCheck className="size-5 text-zinc-600" />
              <p className="mt-3 text-sm font-semibold">Tenant-first SaaS controls</p>
              <p className="mt-1 text-sm text-zinc-500">JWT auth, RBAC, usage limits, trial period, billing, domains, branding, imports, and audit logs.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6">
        <div className="grid gap-4 md:grid-cols-4">
          {landingMetrics.map((metric) => (
            <div key={metric.label} className="rounded-lg border border-zinc-200 bg-white p-4">
              <p className="text-sm text-zinc-500">{metric.label}</p>
              <p className="mt-3 text-2xl font-semibold">{metric.value}</p>
              <p className="mt-1 text-sm text-zinc-500">{metric.detail}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-5">
          <h2 className="text-lg font-semibold">Demo readiness</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {launchChecklist.map((item) => (
              <div key={item} className="rounded-md border border-zinc-200 p-3 text-sm text-zinc-600">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
