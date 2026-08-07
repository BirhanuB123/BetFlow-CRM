"use client";

import { useState } from "react";
import { CheckCircle2, Lock, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignaturePad } from "./signature-pad";
import { apiFetch } from "@/lib/api";
import type { SignerRole, SignatureAuditItem } from "@betflow/shared";

interface SignatureModalProps {
  contractId: string;
  defaultSignerName?: string;
  defaultSignerEmail?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (signature: SignatureAuditItem) => void;
}

export function SignatureModal({
  contractId,
  defaultSignerName = "",
  defaultSignerEmail = "",
  isOpen,
  onClose,
  onSuccess,
}: SignatureModalProps) {
  const [signerName, setSignerName] = useState(defaultSignerName);
  const [signerEmail, setSignerEmail] = useState(defaultSignerEmail);
  const [signerRole, setSignerRole] = useState<SignerRole>("BUYER");
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signerName.trim()) {
      setError("Signer full name is required");
      return;
    }
    if (!signatureDataUrl) {
      setError("Please draw your signature on the canvas pad");
      return;
    }
    if (!agreeTerms) {
      setError("Please confirm the legal agreement checkbox");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await apiFetch<SignatureAuditItem>(`/contracts/${contractId}/signatures`, {
        method: "POST",
        body: JSON.stringify({
          contractId,
          signerName,
          signerEmail: signerEmail || undefined,
          signerRole,
          signatureDataUrl,
        }),
      });
      onSuccess(res);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to record digital signature");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-xl border border-zinc-200 bg-white p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-[#233b66]" />
            <h2 className="text-base font-bold text-zinc-900">E-Signature Verification</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-700">Signer Full Name *</label>
              <input
                type="text"
                required
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                placeholder="e.g. Abebe Bikila"
                className="mt-1 h-9 w-full rounded-md border border-zinc-200 px-3 text-xs font-medium focus:border-[#233b66] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700">Signer Role</label>
              <select
                value={signerRole}
                onChange={(e) => setSignerRole(e.target.value as SignerRole)}
                className="mt-1 h-9 w-full rounded-md border border-zinc-200 px-3 text-xs font-semibold"
              >
                <option value="BUYER">BUYER (Purchaser)</option>
                <option value="SELLER_REP">SELLER (Developer Rep)</option>
                <option value="WITNESS">WITNESS</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-700">Signer Email (Optional)</label>
            <input
              type="email"
              value={signerEmail}
              onChange={(e) => setSignerEmail(e.target.value)}
              placeholder="signer@example.com"
              className="mt-1 h-9 w-full rounded-md border border-zinc-200 px-3 text-xs font-medium focus:border-[#233b66] focus:outline-hidden"
            />
          </div>

          {/* Signature Canvas Pad */}
          <div>
            <label className="text-xs font-semibold text-zinc-700 mb-1 block">
              Draw Signature *
            </label>
            <SignaturePad onSignatureChange={setSignatureDataUrl} width={450} height={160} />
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-start gap-2 pt-1">
            <input
              type="checkbox"
              id="agreeTerms"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5 size-4 rounded border-zinc-300 accent-[#233b66]"
            />
            <label htmlFor="agreeTerms" className="text-[11px] text-zinc-600 font-medium leading-snug">
              I acknowledge that this digital signature constitutes a legally binding intent to sign this property agreement. The timestamp, IP address, and SHA-256 hash will be recorded.
            </label>
          </div>

          {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}

          <div className="flex items-center justify-end gap-2 border-t border-zinc-100 pt-3">
            <Button type="button" variant="outline" onClick={onClose} className="h-9 text-xs">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || !signatureDataUrl || !agreeTerms}
              className="h-9 bg-[#233b66] hover:bg-[#233b66]/90 text-white text-xs gap-1.5 font-semibold"
            >
              <CheckCircle2 className="size-4" />
              {submitting ? "Signing Contract..." : "Confirm & Sign Contract"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
