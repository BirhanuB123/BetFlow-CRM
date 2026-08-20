"use client";

import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-400 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Image
              src="/betflow-mark.svg"
              alt="BetFlow CRM"
              width={32}
              height={32}
              className="rounded-lg bg-white p-1"
            />
            <div>
              <p className="text-sm font-extrabold text-white tracking-tight">
                betflow CRM
              </p>
              <p className="text-xs text-slate-400">
                Real Estate Sales & Contract Automation Operating System
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs font-bold text-slate-300">
            <Link href="/dashboard" className="hover:text-indigo-400 transition-colors">
              Dashboard
            </Link>
            <Link href="/pipeline?tab=leads" className="hover:text-indigo-400 transition-colors">
              Leads
            </Link>
            <Link href="/units" className="hover:text-indigo-400 transition-colors">
              Inventory
            </Link>
            <Link href="/transactions?tab=contracts" className="hover:text-indigo-400 transition-colors">
              Contracts
            </Link>
            <Link href="/portal" className="hover:text-indigo-400 transition-colors">
              Buyer Portal
            </Link>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-900 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} BetFlow S.C. All rights reserved.</p>
          <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-bold">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>All Systems Operational (NestJS + Prisma + PostgreSQL)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
