"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle,
  Code2,
  Copy,
  ExternalLink,
  Globe,
  RefreshCw,
} from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { apiFetch } from "@/lib/api";

type Stats = {
  total: number;
  today: number;
  thisWeek: number;
};

const EXAMPLE_PAYLOAD = JSON.stringify(
  {
    firstName: "Ahmed",
    lastName: "Al-Rashidi",
    email: "ahmed@example.com",
    phone: "+966 50 000 0000",
    company: "Al-Rashidi Properties",
    message: "I'm interested in 3-bedroom units.",
    utmSource: "google",
    utmMedium: "cpc",
    utmCampaign: "summer-2026",
  },
  null,
  2,
);

function StatBadge({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <p className="text-2xl font-bold text-zinc-900">{value}</p>
      <p className="mt-0.5 text-sm text-zinc-500">{label}</p>
    </div>
  );
}

export default function WebsiteLeadsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const apiUrl =
    typeof window !== "undefined"
      ? `${window.location.origin.replace("3001", "4000")}/api/enterprise/website-leads/capture`
      : "/api/enterprise/website-leads/capture";

  useEffect(() => {
    apiFetch<Stats>("/enterprise/website-leads/stats")
      .then(setStats)
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  const copy = (text: string) => {
    void navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const refresh = () => {
    setLoading(true);
    apiFetch<Stats>("/enterprise/website-leads/stats")
      .then(setStats)
      .catch(() => null)
      .finally(() => setLoading(false));
  };

  return (
    <DashboardShell
      title="Website Lead Capture"
      description="Embed this endpoint in your website or landing page to capture leads directly into BetFlow."
      active="Integrations"
    >
      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-xl border border-zinc-100 bg-zinc-50"
            />
          ))
        ) : (
          <>
            <StatBadge label="Total leads captured" value={stats?.total ?? 0} />
            <StatBadge label="Captured today" value={stats?.today ?? 0} />
            <StatBadge label="This week" value={stats?.thisWeek ?? 0} />
          </>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Endpoint card */}
        <section className="rounded-xl border border-zinc-200 bg-white">
          <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
            <div className="flex items-center gap-2">
              <Globe className="size-4 text-info" />
              <h2 className="font-semibold">Capture Endpoint</h2>
            </div>
            <button
              onClick={refresh}
              className="flex items-center gap-1 rounded-lg border border-zinc-200 px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-50"
            >
              <RefreshCw className="size-3" />
              Refresh
            </button>
          </div>

          <div className="p-5 space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400 mb-1">
                Method
              </p>
              <span className="inline-block rounded-md bg-success/10 px-2 py-0.5 text-sm font-mono font-bold text-success">
                POST
              </span>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400 mb-1">
                URL
              </p>
              <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2">
                <code className="flex-1 truncate text-sm text-zinc-800">
                  {apiUrl}
                </code>
                <button
                  onClick={() => copy(apiUrl)}
                  className="shrink-0 text-zinc-400 hover:text-zinc-700"
                  title="Copy URL"
                >
                  {copied ? (
                    <CheckCircle className="size-4 text-success" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400 mb-1">
                Auth
              </p>
              <p className="text-sm text-zinc-600">
                No authentication required — this endpoint is public. Protect it
                with CORS and rate-limiting at your reverse proxy.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                "firstName *",
                "lastName *",
                "email",
                "phone",
                "company",
                "message",
                "utmSource",
                "utmMedium",
                "utmCampaign",
              ].map((f) => (
                <span
                  key={f}
                  className={`rounded-full px-2 py-0.5 text-xs font-mono ${f.endsWith("*") ? "bg-info/10 text-info" : "bg-zinc-100 text-zinc-600"}`}
                >
                  {f}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Code snippet */}
        <section className="rounded-xl border border-zinc-200 bg-white">
          <div className="flex items-center gap-2 border-b border-zinc-200 px-5 py-4">
            <Code2 className="size-4 text-info" />
            <h2 className="font-semibold">Example Payload</h2>
          </div>
          <div className="relative p-5">
            <pre className="overflow-auto rounded-lg bg-zinc-950 p-4 text-xs leading-relaxed text-success">
              <code>
                {`fetch("${apiUrl}", {\n  method: "POST",\n  headers: { "Content-Type": "application/json" },\n  body: JSON.stringify(`}
                {"\n"}
                {EXAMPLE_PAYLOAD}
                {`)\n});`}
              </code>
            </pre>
            <button
              onClick={() =>
                copy(
                  `fetch("${apiUrl}", {\n  method: "POST",\n  headers: { "Content-Type": "application/json" },\n  body: JSON.stringify(${EXAMPLE_PAYLOAD})\n});`,
                )
              }
              className="absolute right-8 top-8 rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-700"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>

          <div className="border-t border-zinc-200 px-5 py-4">
            <p className="mb-2 text-sm font-semibold text-zinc-700">
              Success response
            </p>
            <pre className="rounded-lg bg-zinc-50 p-3 text-xs text-zinc-700">
              {`{\n  "success": true,\n  "leadId": "uuid",\n  "message": "Lead captured successfully. Our team will be in touch shortly."\n}`}
            </pre>
          </div>
        </section>
      </div>

      {/* Setup guide */}
      <section className="mt-6 rounded-xl border border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 px-5 py-4">
          <h2 className="font-semibold">Setup Guide</h2>
          <p className="text-sm text-zinc-500">
            Connect your website, landing page, or chatbot in 3 steps.
          </p>
        </div>
        <ol className="divide-y divide-zinc-100">
          {[
            {
              step: "1",
              title: "Add a contact form to your website",
              desc: "Include firstName, lastName, email, and phone fields. Add UTM hidden fields to track campaign source.",
            },
            {
              step: "2",
              title: "Submit the form to the capture endpoint",
              desc: "On submit, send a POST request with a JSON body to the URL above. No API key needed.",
            },
            {
              step: "3",
              title: "Monitor leads in BetFlow",
              desc: "New leads appear instantly in the Leads module tagged with the 'Website' source. Assign them to agents.",
            },
          ].map((item) => (
            <li key={item.step} className="flex items-start gap-4 px-5 py-4">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-info/10 text-sm font-bold text-info">
                {item.step}
              </span>
              <div>
                <p className="text-sm font-medium text-zinc-800">
                  {item.title}
                </p>
                <p className="mt-0.5 text-sm text-zinc-500">{item.desc}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="border-t border-zinc-200 px-5 py-3">
          <a
            href="https://developers.betflow.app/website-leads"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-sm text-info hover:underline"
          >
            <ExternalLink className="size-3" />
            Full integration documentation
          </a>
        </div>
      </section>
    </DashboardShell>
  );
}
