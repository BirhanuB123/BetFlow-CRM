"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  ExternalLink,
  RefreshCw,
  Share2,
  ShieldCheck,
  Webhook,
} from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { apiFetch } from "@/lib/api";

type Stats = {
  facebook: number;
  instagram: number;
  total: number;
  thisWeek: number;
  webhookConfigured: boolean;
  signatureValidation: boolean;
};

function StatBadge({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <p className="text-2xl font-bold text-zinc-900">{value}</p>
      <p className="mt-0.5 text-sm text-zinc-500">{label}</p>
    </div>
  );
}

function StatusPill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${ok ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"}`}>
      {ok ? <CheckCircle2 className="size-4" /> : <AlertTriangle className="size-4" />}
      {label}
    </div>
  );
}

export default function SocialLeadsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  const webhookUrl =
    typeof window !== "undefined"
      ? `${window.location.origin.replace("3001", "3000")}/api/enterprise/social-leads/meta-webhook`
      : "/api/enterprise/social-leads/meta-webhook";

  useEffect(() => {
    apiFetch<Stats>("/enterprise/social-leads/stats")
      .then(setStats)
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  const copy = (text: string, key: string) => {
    void navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const refresh = () => {
    setLoading(true);
    apiFetch<Stats>("/enterprise/social-leads/stats")
      .then(setStats)
      .catch(() => null)
      .finally(() => setLoading(false));
  };

  return (
    <DashboardShell
      title="Facebook & Instagram Lead Ads"
      description="Receive Meta Lead Ad submissions directly into BetFlow via webhook."
      active="Integrations"
    >
      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl border border-zinc-100 bg-zinc-50" />
          ))
        ) : (
          <>
            <StatBadge label="Total leads" value={stats?.total ?? 0} />
            <StatBadge label="From Facebook" value={stats?.facebook ?? 0} />
            <StatBadge label="From Instagram" value={stats?.instagram ?? 0} />
            <StatBadge label="This week" value={stats?.thisWeek ?? 0} />
          </>
        )}
      </div>

      {/* Config status */}
      <div className="mb-6 flex flex-wrap gap-3">
        <StatusPill
          ok={stats?.webhookConfigured ?? false}
          label={stats?.webhookConfigured ? "Verify token configured" : "META_VERIFY_TOKEN not set"}
        />
        <StatusPill
          ok={stats?.signatureValidation ?? false}
          label={stats?.signatureValidation ? "Signature validation active" : "META_APP_SECRET not set — validation skipped"}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Webhook config */}
        <section className="rounded-xl border border-zinc-200 bg-white">
          <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
            <div className="flex items-center gap-2">
              <Webhook className="size-4 text-blue-500" />
              <h2 className="font-semibold">Webhook Configuration</h2>
            </div>
            <button
              onClick={refresh}
              className="flex items-center gap-1 rounded-lg border border-zinc-200 px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-50"
            >
              <RefreshCw className="size-3" />
              Refresh
            </button>
          </div>

          <div className="divide-y divide-zinc-100">
            {[
              {
                label: "Callback URL",
                value: webhookUrl,
                key: "url",
                mono: true,
              },
              {
                label: "Verify Token (env var)",
                value: "META_VERIFY_TOKEN",
                key: "token",
                mono: true,
              },
              {
                label: "App Secret (env var)",
                value: "META_APP_SECRET",
                key: "secret",
                mono: true,
              },
              {
                label: "Subscribed Fields",
                value: "leadgen",
                key: "fields",
                mono: false,
              },
            ].map((row) => (
              <div key={row.key} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <p className="text-xs text-zinc-400">{row.label}</p>
                  <p className={`mt-0.5 truncate text-sm ${row.mono ? "font-mono text-zinc-800" : "text-zinc-700"}`}>
                    {row.value}
                  </p>
                </div>
                <button
                  onClick={() => copy(row.value, row.key)}
                  className="shrink-0 text-zinc-400 hover:text-zinc-700"
                >
                  {copied === row.key ? (
                    <CheckCircle2 className="size-4 text-emerald-500" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Env vars */}
        <section className="rounded-xl border border-zinc-200 bg-white">
          <div className="flex items-center gap-2 border-b border-zinc-200 px-5 py-4">
            <ShieldCheck className="size-4 text-violet-500" />
            <h2 className="font-semibold">Environment Variables</h2>
          </div>
          <div className="p-5 space-y-3">
            <p className="text-sm text-zinc-500">
              Add these to your <code className="rounded bg-zinc-100 px-1 font-mono text-xs">.env.local</code> file on the API server.
            </p>
            <pre className="overflow-auto rounded-lg bg-zinc-950 p-4 text-xs leading-relaxed text-emerald-300">
              {`# Meta webhook verification token
# Must match the value you enter in Meta Developer Portal
META_VERIFY_TOKEN=your_random_secret_token

# App Secret from Meta Developer Portal > App Settings > Basic
# Used to validate X-Hub-Signature-256 on every POST
META_APP_SECRET=your_meta_app_secret`}
            </pre>
          </div>

          <div className="border-t border-zinc-200 px-5 py-4">
            <p className="mb-2 text-sm font-medium text-zinc-700">Webhook payload structure</p>
            <pre className="rounded-lg bg-zinc-50 p-3 text-xs text-zinc-700 overflow-auto">
              {`{
  "object": "page",
  "entry": [{
    "id": "<PAGE_ID>",
    "changes": [{
      "field": "leadgen",
      "value": {
        "leadgen_id": "...",
        "form_id": "...",
        "campaign_name": "...",
        "field_data": [
          { "name": "full_name", "values": ["Ahmed Al-Rashidi"] },
          { "name": "email",     "values": ["ahmed@example.com"] },
          { "name": "phone_number", "values": ["+966 50 000 0000"] }
        ]
      }
    }]
  }]
}`}
            </pre>
          </div>
        </section>
      </div>

      {/* Setup steps */}
      <section className="mt-6 rounded-xl border border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 px-5 py-4">
          <div className="flex items-center gap-2">
            <Share2 className="size-4 text-blue-600" />
            <h2 className="font-semibold">Setup Guide — Meta Developer Portal</h2>
          </div>
        </div>
        <ol className="divide-y divide-zinc-100">
          {[
            {
              step: "1",
              title: "Create a Meta App",
              desc: "Go to developers.facebook.com → My Apps → Create App. Choose 'Business' type and link your Facebook Page.",
            },
            {
              step: "2",
              title: "Add Webhooks & Lead Ads product",
              desc: "Under 'Products', add 'Webhooks' and 'Lead Ads'. Subscribe to the Page webhook and select the 'leadgen' field.",
            },
            {
              step: "3",
              title: "Configure the callback URL",
              desc: `Paste the Callback URL shown above. Enter the same value as your META_VERIFY_TOKEN env var for Verify Token.`,
            },
            {
              step: "4",
              title: "Set env vars and restart API",
              desc: "Add META_VERIFY_TOKEN and META_APP_SECRET to your .env.local, then restart the API server.",
            },
            {
              step: "5",
              title: "Test with Meta's lead form tester",
              desc: "In Meta Business Suite → Lead Ads Forms, use the testing tool to send a sample lead. It should appear in BetFlow within seconds.",
            },
          ].map((item) => (
            <li key={item.step} className="flex items-start gap-4 px-5 py-4">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600">
                {item.step}
              </span>
              <div>
                <p className="text-sm font-medium text-zinc-800">{item.title}</p>
                <p className="mt-0.5 text-sm text-zinc-500">{item.desc}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="border-t border-zinc-200 px-5 py-3">
          <a
            href="https://developers.facebook.com/docs/marketing-api/guides/lead-ads/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
          >
            <ExternalLink className="size-3" />
            Meta Lead Ads Webhook documentation
          </a>
        </div>
      </section>
    </DashboardShell>
  );
}
