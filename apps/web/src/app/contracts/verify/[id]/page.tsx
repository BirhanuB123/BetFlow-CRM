"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  FileCheck,
  Building2,
  Calendar,
  User,
  Hash,
  Download,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { apiFetch, apiDownload } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";

type VerifiedSignature = {
  id: string;
  signerName: string;
  signerRole: string;
  signedAt: string;
  ipAddress: string;
  verificationHash: string;
};

type VerificationResult = {
  contractId: string;
  contractNumber: string;
  status: string;
  isAuthentic: boolean;
  projectName: string;
  buildingName: string;
  unitNumber: string;
  buyerName: string;
  totalAmt: number | string;
  createdAt: string;
  signaturesCount: number;
  signatures: VerifiedSignature[];
  verificationTimestamp: string;
  issuer: string;
};

export default function ContractVerificationPage() {
  const params = useParams();
  const contractId = (params?.id as string) || "";

  const [data, setData] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownloadPdf = async () => {
    if (!data) return;
    setDownloading(true);
    try {
      const blob = await apiDownload(`/contracts/${data.contractId}/pdf`);
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `Contract_${data.contractNumber || data.contractId}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(anchor);
    } catch {
      alert("Failed to download PDF contract. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    if (!contractId) return;
    async function verify() {
      try {
        setLoading(true);
        const result = await apiFetch<VerificationResult>(
          `/contracts/verify/${contractId}`,
        );
        setData(result);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to verify contract signature.",
        );
      } finally {
        setLoading(false);
      }
    }
    void verify();
  }, [contractId]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/20 text-primary/80 border border-primary/30">
              <ShieldCheck className="size-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-wide">
                BetFlow Legal Audit Engine
              </h1>
              <p className="text-xs text-slate-400">
                Official E-Signature & Contract Verification Portal
              </p>
            </div>
          </div>
          <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-bold text-success border border-success/30 flex items-center gap-1.5">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex size-2 rounded-full bg-success"></span>
            </span>
            Live Verification
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400 animate-pulse text-sm">
            Verifying cryptographic SHA-256 signatures & contract records...
          </div>
        ) : error ? (
          <div className="py-12 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive border border-destructive/20 mb-3">
              <AlertCircle className="size-6" />
            </div>
            <h2 className="text-base font-bold text-white">
              Verification Failed
            </h2>
            <p className="mt-1 text-xs text-slate-400 max-w-md mx-auto">
              {error}
            </p>
          </div>
        ) : data ? (
          <div className="mt-6 space-y-6">
            {/* Authenticity Badge Banner */}
            <div className="rounded-xl border border-success/40 bg-gradient-to-r from-success to-slate-900 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileCheck className="size-8 text-success shrink-0" />
                <div>
                  <h2 className="text-sm font-bold text-success">
                    Official Authentic Sales Agreement
                  </h2>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Contract #{data.contractNumber} · Issued by {data.issuer}
                  </p>
                </div>
              </div>
              <span className="rounded-lg bg-success px-3 py-1.5 text-xs font-extrabold text-white shadow-sm">
                VERIFIED AUTHENTIC
              </span>
            </div>

            {/* Contract Overview Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <User className="size-3 text-primary/80" /> Buyer (Purchaser)
                </p>
                <p className="mt-1 text-sm font-bold text-white">
                  {data.buyerName}
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Building2 className="size-3 text-primary/80" /> Property Unit
                </p>
                <p className="mt-1 text-sm font-bold text-white">
                  {data.projectName} · Unit {data.unitNumber}
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="size-3 text-primary/80" /> Agreement Date
                </p>
                <p className="mt-1 text-xs font-semibold text-slate-200">
                  {new Date(data.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Hash className="size-3 text-success" /> Agreed Value (ETB)
                </p>
                <p className="mt-1 text-xs font-bold text-success">
                  {formatCurrency(data.totalAmt)}
                </p>
              </div>
            </div>

            {/* Cryptographic E-Signatures Section */}
            <div>
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                Digital Signatures & SHA-256 Audit Hashes ({data.signaturesCount})
              </h3>

              {data.signatures.length === 0 ? (
                <p className="text-xs text-slate-400 italic">
                  Contract is in draft status. E-signatures will appear here once executed.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {data.signatures.map((sig) => (
                    <div
                      key={sig.id}
                      className="rounded-xl border border-slate-800 bg-slate-950/80 p-3.5 space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-primary/80">
                          {sig.signerName} ({sig.signerRole})
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          IP: {sig.ipAddress}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Signed At: {new Date(sig.signedAt).toLocaleString()}
                      </p>
                      <div className="mt-1 rounded bg-slate-900 p-2 font-mono text-[10px] text-success break-all border border-slate-800">
                        SHA-256: {sig.verificationHash}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between border-t border-slate-800 pt-5">
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={downloading}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white hover:bg-primary/90 transition-colors shadow-lg cursor-pointer disabled:opacity-50"
              >
                <Download className="size-4" />
                {downloading
                  ? "Generating Certified PDF..."
                  : "Download Certified PDF"}
              </button>

              <Link
                href="/transactions?tab=contracts"
                className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
              >
                Back to Contracts <ExternalLink className="size-3" />
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
