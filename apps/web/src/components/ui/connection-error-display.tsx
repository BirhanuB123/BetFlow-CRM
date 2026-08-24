"use client";

import { useState, useEffect } from "react";
import {
  WifiOff,
  RotateCw,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Server,
  Terminal,
  ShieldAlert,
  Home,
  RefreshCw,
} from "lucide-react";
import Image from "next/image";

interface ConnectionErrorDisplayProps {
  url?: string;
  errorCode?: string;
  errorMessage?: string;
  onRetry?: () => void;
  autoRetrySeconds?: number;
}

export function ConnectionErrorDisplay({
  url = "http://localhost:3001/auth",
  errorCode = "ERR_CONNECTION_REFUSED (-102)",
  errorMessage = "The application could not establish a connection to the server. Please check your local network or server status.",
  onRetry,
  autoRetrySeconds = 10,
}: ConnectionErrorDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [countdown, setCountdown] = useState(autoRetrySeconds);
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRetry = () => {
    setRetrying(true);
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  // Auto retry countdown timer
  useEffect(() => {
    if (countdown <= 0) {
      setRetrying(true);
      if (onRetry) {
        onRetry();
      } else {
        window.location.reload();
      }
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, onRetry]);

  const progressPercent = (countdown / autoRetrySeconds) * 100;

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#0b0f17] p-4 text-slate-100 selection:bg-[#0E6E63]/30 selection:text-[#2dd4bf] sm:p-6 lg:p-8 font-sans">
      {/* Dynamic Glow Orbs Background */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[550px] w-[550px] -translate-x-1/2 rounded-full bg-radial from-destructive via-[#0E6E63]/10 to-transparent blur-[70px] animate-pulse" />
      <div className="pointer-events-none absolute -bottom-20 right-10 h-[380px] w-[380px] rounded-full bg-radial from-[#0E6E63]/20 to-transparent blur-[60px]" />

      {/* Background Mesh Grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
        }}
      />

      {/* Main Glassmorphism Card */}
      <div className="relative z-10 w-full max-w-[500px] rounded-3xl border border-white/10 bg-slate-900/80 p-6 sm:p-8 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.7)] backdrop-blur-2xl transition-all duration-300">
        {/* Brand Header */}
        <div className="mb-6 flex flex-col items-center justify-center gap-1 text-center">
          <div className="flex items-center gap-2">
            <Image
              src="/betflow-logo.svg"
              alt="BetFlow CRM"
              width={140}
              height={36}
              priority
              className="h-8 w-auto brightness-200"
            />
          </div>
          <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Corporate CRM Portal
          </span>
        </div>

        {/* Radar Icon Wrapper */}
        <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-destructive/30 bg-destructive/10 shadow-[0_0_25px_rgba(244,63,94,0.25)]" />
          <div className="absolute -inset-2.5 rounded-full border border-dashed border-destructive/25 animate-[spin_15s_linear_infinite]" />
          <WifiOff className="relative z-10 size-9 text-destructive" />
        </div>

        {/* Error Code Pill */}
        <div className="mx-auto mb-3 flex w-max items-center gap-2 rounded-full border border-destructive/30 bg-destructive/10 px-3.5 py-1 text-xs font-mono font-medium text-destructive shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive"></span>
          </span>
          {errorCode}
        </div>

        {/* Title & Description */}
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Unable to Connect
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            {errorMessage}
          </p>
        </div>

        {/* URL Container */}
        <div className="mt-6 flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-slate-950/60 p-2.5 px-3.5 backdrop-blur-md">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
              URL
            </span>
            <span
              className="truncate font-mono text-xs text-info"
              title={url}
            >
              {url}
            </span>
          </div>
          <button
            onClick={handleCopy}
            type="button"
            className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 transition hover:bg-white/10 hover:text-white"
            title="Copy URL"
          >
            {copied ? (
              <Check className="size-3.5 text-success" />
            ) : (
              <Copy className="size-3.5" />
            )}
          </button>
        </div>

        {/* Action Button */}
        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={handleRetry}
            disabled={retrying}
            type="button"
            className="group relative flex h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-[#0E6E63] to-[#0b5c52] px-5 font-medium text-white shadow-lg shadow-[#0E6E63]/25 transition-all duration-200 hover:from-[#107e71] hover:to-[#0d695d] hover:shadow-xl hover:shadow-[#0E6E63]/35 active:scale-[0.99] disabled:opacity-75"
          >
            {retrying ? (
              <>
                <RefreshCw className="size-4 animate-spin text-white" />
                <span>Reconnecting...</span>
              </>
            ) : (
              <>
                <RotateCw className="size-4 text-white transition-transform duration-300 group-hover:rotate-180" />
                <span>Try Reconnecting</span>
              </>
            )}
          </button>
        </div>

        {/* Auto Retry Progress Bar */}
        <div className="mt-4">
          <div className="h-1 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full bg-[#0E6E63] transition-all duration-1000 ease-linear"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="mt-1.5 text-center text-xs text-slate-500">
            Auto-retrying in{" "}
            <span className="font-mono text-slate-300">{countdown}s</span>
          </p>
        </div>

        {/* Diagnostics Checklist */}
        <div className="mt-6 border-t border-white/10 pt-4">
          <button
            onClick={() => setShowDiagnostics(!showDiagnostics)}
            type="button"
            className="flex w-full items-center justify-between text-left text-xs font-semibold text-slate-400 transition hover:text-slate-200"
          >
            <span className="flex items-center gap-2">
              <ShieldAlert className="size-4 text-[#0E6E63]" />
              Quick Troubleshooting Checklist
            </span>
            {showDiagnostics ? (
              <ChevronUp className="size-4" />
            ) : (
              <ChevronDown className="size-4" />
            )}
          </button>

          {showDiagnostics && (
            <div className="mt-3 flex flex-col gap-2 rounded-xl border border-white/5 bg-black/30 p-3 text-xs text-slate-400">
              <div className="flex items-start gap-2.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#0E6E63]/20 font-bold text-[#2dd4bf]">
                  1
                </span>
                <p>
                  Ensure local dev server is running (<code>npm run dev</code>{" "}
                  on port 3001).
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#0E6E63]/20 font-bold text-[#2dd4bf]">
                  2
                </span>
                <p>
                  Verify backend API service is active (
                  <code>http://localhost:4000/api</code>).
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#0E6E63]/20 font-bold text-[#2dd4bf]">
                  3
                </span>
                <p>
                  Check if firewall, proxy, or local port conflict is blocking{" "}
                  <code>localhost</code>.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Credit */}
        <div className="mt-6 text-center text-[11px] text-slate-600">
          BetFlow CRM • Developed by Gebeta Trading Technology
        </div>
      </div>
    </main>
  );
}
