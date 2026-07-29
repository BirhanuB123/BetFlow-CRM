"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Plus, RotateCw, Trash2, X } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { CrmTable } from "@/components/tables/crm-table";
import { apiFetch } from "@/lib/api";

type CustomDomain = {
  id: string;
  domain: string;
  status: "verified" | "pending_dns" | "failed";
  ssl: "active" | "pending";
  target: string;
};

const dnsStatusClass = {
  verified: "bg-emerald-50 text-emerald-700 border-emerald-200",
  pending_dns: "bg-amber-50 text-amber-800 border-amber-200",
  failed: "bg-red-50 text-red-700 border-red-200",
};

const sslStatusClass = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  pending: "bg-amber-50 text-amber-800 border-amber-200",
};

export default function DomainsPage() {
  const [domains, setDomains] = useState<CustomDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDomain, setNewDomain] = useState("");
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadDomains = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<CustomDomain[]>("/saas/domains");
      setDomains(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load custom domains");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDomains();
  }, []);

  const handleAddDomain = async (e: FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim()) return;
    setAdding(true);
    setError(null);
    try {
      const created = await apiFetch<CustomDomain>("/saas/domains", {
        method: "POST",
        body: JSON.stringify({ domain: newDomain.trim() }),
      });
      setDomains((prev) => [...prev, created]);
      setNewDomain("");
      setShowAddForm(false);
      showSuccess("Custom domain added successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add domain");
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteDomain = async (id: string) => {
    if (!confirm("Are you sure you want to delete this custom domain?")) return;
    setDeletingId(id);
    setError(null);
    try {
      await apiFetch(`/saas/domains/${id}`, {
        method: "DELETE",
      });
      setDomains((prev) => prev.filter((d) => d.id !== id));
      showSuccess("Custom domain deleted");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete domain");
    } finally {
      setDeletingId(null);
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const verifiedCount = domains.filter((d) => d.status === "verified").length;
  const pendingCount = domains.filter((d) => d.status === "pending_dns").length;
  const sslCount = domains.filter((d) => d.ssl === "active").length;

  return (
    <DashboardShell
      title="Custom domains"
      description="CNAME records, SSL Certificates, and domain routing."
      active="Custom domains"
    >
      <Link
        href="/settings"
        className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#233b66] transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to Settings
      </Link>
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <StatCard label="Verified domains" value={String(verifiedCount)} detail="Production traffic is routable" />
        <StatCard label="Pending DNS" value={String(pendingCount)} detail="CNAME records required" />
        <StatCard label="SSL certificates" value={`${sslCount}/${domains.length}`} detail="Certificates issue after DNS verification" />
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="mb-4 flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
          <Check className="size-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <section className="rounded-lg border border-zinc-200 bg-white">
        <div className="flex items-center justify-between gap-4 border-b border-zinc-200 p-4">
          <div>
            <h2 className="text-base font-semibold">Domains</h2>
            <p className="text-sm text-zinc-500">CNAME targets and certificate state.</p>
          </div>
          <Button onClick={() => setShowAddForm((v) => !v)} variant="outline">
            {showAddForm ? <X className="size-4 mr-1" /> : <Plus className="size-4 mr-1" />}
            {showAddForm ? "Cancel" : "Add domain"}
          </Button>
        </div>

        {showAddForm && (
          <form onSubmit={handleAddDomain} className="flex flex-col sm:flex-row gap-3 bg-zinc-50 p-4 border-b border-zinc-200">
            <input
              className="h-10 flex-1 max-w-md rounded-md border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-400"
              placeholder="e.g. sales.mycompany.com"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              required
            />
            <Button type="submit" disabled={adding}>
              {adding ? <RotateCw className="size-4 animate-spin mr-1" /> : null}
              Add Domain
            </Button>
          </form>
        )}

        {loading ? (
          <p className="p-6 text-sm text-zinc-500">Loading domains…</p>
        ) : domains.length === 0 ? (
          <p className="p-6 text-sm text-zinc-500 text-center">No custom domains configured.</p>
        ) : (
          <CrmTable
            columns={["Domain", "Target", "DNS Status", "SSL Status", "Actions"]}
            rows={domains.map((domain) => [
              <span key="domain" className="font-medium">{domain.domain}</span>,
              <code key="target" className="bg-zinc-100 px-1.5 py-0.5 rounded text-xs text-zinc-700">{domain.target}</code>,
              <span key="dns" className={`rounded-md border px-2 py-0.5 text-xs font-medium uppercase ${dnsStatusClass[domain.status]}`}>
                {domain.status === "pending_dns" ? "Pending DNS" : domain.status}
              </span>,
              <span key="ssl" className={`rounded-md border px-2 py-0.5 text-xs font-medium uppercase ${sslStatusClass[domain.ssl]}`}>
                {domain.ssl}
              </span>,
              <Button
                key="action"
                variant="ghost"
                size="icon-sm"
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={() => handleDeleteDomain(domain.id)}
                disabled={deletingId === domain.id}
              >
                {deletingId === domain.id ? <RotateCw className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
              </Button>,
            ])}
          />
        )}
      </section>
    </DashboardShell>
  );
}
