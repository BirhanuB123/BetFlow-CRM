import Link from "next/link";
import { Check } from "lucide-react";

import { pricingPlans } from "@/features/go-to-market/go-to-market-data";

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#f6f7f9] text-zinc-950">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="text-sm font-semibold">BetFlow CRM</Link>
          <Link href="/auth" className="rounded-md bg-zinc-950 px-3 py-2 text-sm font-medium text-white">Open demo</Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Pricing</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Plans for every real estate sales operation.</h1>
          <p className="mt-4 text-base leading-7 text-zinc-600">
            Start with the seeded demo, then choose the plan that fits your tenant size, automation volume, and integration requirements.
          </p>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-4">
          {pricingPlans.map((plan) => (
            <section key={plan.name} className={`rounded-lg border bg-white p-5 ${plan.featured ? "border-zinc-950 shadow-sm" : "border-zinc-200"}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">{plan.name}</h2>
                  <p className="mt-2 text-sm text-zinc-500">{plan.detail}</p>
                </div>
                {plan.featured ? <span className="rounded-md bg-zinc-950 px-2 py-1 text-xs font-medium text-white">Popular</span> : null}
              </div>
              <p className="mt-5 text-3xl font-semibold">{plan.price}</p>
              <p className="mt-1 text-sm text-zinc-500">{plan.price === "Custom" ? "Annual contract" : "per tenant/month"}</p>
              <ul className="mt-5 space-y-3">
                {plan.includes.map((item) => (
                  <li key={item} className="flex gap-2 text-sm text-zinc-600">
                    <Check className="mt-0.5 size-4 text-emerald-600" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/auth" className="mt-6 inline-flex h-10 w-full items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-medium text-white">
                Start demo
              </Link>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}
