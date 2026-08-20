"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function CtaBanner() {
  return (
    <section className="relative overflow-hidden py-16 bg-gradient-to-r from-indigo-900 via-[#233b66] to-slate-950 text-white border-t border-slate-800">
      <div className="relative z-10 mx-auto max-w-5xl px-4 text-center sm:px-6">
        <h2 className="text-3xl font-extrabold sm:text-4xl text-white">
          Ready to streamline your real estate sales pipeline?
        </h2>
        <p className="mt-4 text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Get instant access to the BetFlow CRM command center with live unit stacking, buyer lead intake, and automated contract workflows.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/dashboard"
            className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-8 text-sm font-extrabold text-white shadow-lg hover:bg-indigo-500 active:scale-[0.98] transition-all w-full sm:w-auto cursor-pointer"
          >
            <span>Start Free 14-Day Trial</span>
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>

          <Link
            href="#workspace-preview"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-indigo-500/40 bg-indigo-600/20 px-6 text-sm font-bold text-indigo-200 hover:bg-indigo-600/30 hover:text-white transition-all w-full sm:w-auto cursor-pointer"
          >
            <Sparkles className="size-4 text-indigo-400" />
            <span>Explore Live Workspace</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
