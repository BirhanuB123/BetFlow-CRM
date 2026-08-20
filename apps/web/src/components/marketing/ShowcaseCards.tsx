"use client";

import Image from "next/image";
import { Grid, FileSignature, Coins } from "lucide-react";

export function ShowcaseCards() {
  return (
    <section className="py-20 bg-slate-900 border-t border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-16">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-400">
            High-Craft Real Estate Workflows
          </span>
          <h2 className="mt-2 text-3xl font-black text-white sm:text-4xl">
            Turn every buyer lead into a closed property sale
          </h2>
          <p className="mt-3 text-sm text-slate-400">
            Purpose-built tools for managing high-value residential, commercial, and diaspora property sales.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Render Card */}
          <div className="relative rounded-2xl border border-slate-800 bg-slate-950 p-3 shadow-xl overflow-hidden group">
            <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-slate-900">
              <Image
                src="/interior.png"
                alt="Modern Apartment Living Render"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
              
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-slate-950/90 backdrop-blur-md border border-slate-800 text-xs">
                <span className="rounded bg-indigo-600/30 border border-indigo-500/40 px-2 py-0.5 text-[10px] font-extrabold text-indigo-300 uppercase">
                  Luxury Penthouse Interior
                </span>
                <h4 className="text-sm font-extrabold text-white mt-1">Floor 14 • Penthouse A</h4>
                <p className="text-[11px] text-slate-300 mt-0.5">240 sqm • Panoramic City View • Reserved</p>
              </div>
            </div>
          </div>

          {/* Right Feature Highlights */}
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  <Grid className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Atomic Unit Reservation Locks</h3>
                  <p className="text-xs text-slate-400">Zero risk of double booking. SQL row locks guarantee instant unit reservation status.</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <FileSignature className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">SHA-256 Verified PDF Contracts</h3>
                  <p className="text-xs text-slate-400">Server-side legal contract generation with mouse/touch signature pads and timestamped hash.</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Coins className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Milestone Payment Schedules</h3>
                  <p className="text-xs text-slate-400">Track 30% downpayments, construction milestones, overdue penalties, and bank deposit slips.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
