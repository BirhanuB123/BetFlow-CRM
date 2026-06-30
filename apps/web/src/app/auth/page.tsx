import { Building2, KeyRound, LockKeyhole, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function AuthPage() {
  return (
    <main className="min-h-screen bg-[#f6f7f9] px-4 py-8 text-zinc-950">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="flex flex-col justify-between rounded-lg border border-zinc-200 bg-zinc-950 p-6 text-white">
          <div>
            <div className="flex size-11 items-center justify-center rounded-lg bg-white text-sm font-semibold text-zinc-950">
              BF
            </div>
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
          <div>
            <p className="text-sm font-medium text-zinc-500">New tenant</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">Register workspace</h2>
          </div>
          <form className="mt-6 grid gap-4">
            {[
              { label: "Company name", placeholder: "BetFlow Realty", icon: Building2 },
              { label: "Workspace slug", placeholder: "betflow-realty", icon: LockKeyhole },
              { label: "Owner email", placeholder: "owner@company.com", icon: Mail },
              { label: "Password", placeholder: "Minimum 12 characters", icon: KeyRound, type: "password" },
            ].map((field) => {
              const Icon = field.icon;

              return (
                <label key={field.label} className="grid gap-2 text-sm font-medium">
                  {field.label}
                  <span className="flex h-11 items-center gap-3 rounded-md border border-zinc-200 px-3">
                    <Icon className="size-4 text-zinc-500" />
                    <input
                      className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-400"
                      placeholder={field.placeholder}
                      type={field.type ?? "text"}
                    />
                  </span>
                </label>
              );
            })}
            <Button className="mt-2 h-10">Create tenant</Button>
          </form>

          <div className="mt-8 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
            <h3 className="text-sm font-semibold">Auth policy included</h3>
            <ul className="mt-3 grid gap-2 text-sm text-zinc-600">
              <li>Password login with owner bootstrap</li>
              <li>Invite-based user onboarding</li>
              <li>Audit event emitted for registration and login</li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}
