"use client";

import Link from "next/link";
import Image from "next/image";
import { VALUE_PILLARS } from "@/features/go-to-market/value-pillars";

export function Footer() {
  const organizePillar = VALUE_PILLARS.find((p) => p.id === "organize");
  const engagePillar = VALUE_PILLARS.find((p) => p.id === "engage");
  const closePillar = VALUE_PILLARS.find((p) => p.id === "close");

  return (
    <footer className="border-t border-slate-200 bg-slate-100 text-slate-600 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-center gap-3">
              <Image
                src="/betflow-mark.svg"
                alt="BetFlow CRM"
                width={36}
                height={36}
                className="rounded-lg bg-indigo-600 p-1 shadow-xs"
              />
              <div>
                <p className="text-base font-black text-slate-900 tracking-tight">
                  betflow CRM
                </p>
                <p className="text-xs text-slate-500 font-semibold">
                  Real Estate Sales & Contract Operating System
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
              Purpose-built CRM OS for real estate developers, brokerages, and sales teams. Streamline buyer intake, floorplan inventory elevation, legal contracts, and payment milestones.
            </p>

            {/* Note: Ground Rule — Add a support contact line (phone/hours) only if the client confirms a real number to publish. Do not invent numbers. */}
            {/* TODO: Insert verified client support helpline phone & operating hours when confirmed */}
          </div>

          {/* Pillar 1: Organize Column */}
          <div className="space-y-3">
            <p className="text-xs font-black text-slate-900 uppercase tracking-wider">
              {organizePillar?.title || "Organize"}
            </p>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <Link href="/pipeline?tab=leads" className="hover:text-indigo-600 transition-colors">
                  Lead Intake CRM
                </Link>
              </li>
              <li>
                <Link href="/units" className="hover:text-indigo-600 transition-colors">
                  Unit Stacking Elevation
                </Link>
              </li>
              <li>
                <Link href="/properties" className="hover:text-indigo-600 transition-colors">
                  Property Catalog
                </Link>
              </li>
              <li>
                <Link href="/customers" className="hover:text-indigo-600 transition-colors">
                  Buyer Directory
                </Link>
              </li>
            </ul>
          </div>

          {/* Pillar 2: Engage Column */}
          <div className="space-y-3">
            <p className="text-xs font-black text-slate-900 uppercase tracking-wider">
              {engagePillar?.title || "Engage"}
            </p>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <Link href="/site-visits" className="hover:text-indigo-600 transition-colors">
                  Site Visit Scheduler
                </Link>
              </li>
              <li>
                <Link href="/pipeline" className="hover:text-indigo-600 transition-colors">
                  Sales Kanban Pipeline
                </Link>
              </li>
              <li>
                <Link href="/activities" className="hover:text-indigo-600 transition-colors">
                  Follow-up Reminders
                </Link>
              </li>
              <li>
                <Link href="/forecasting" className="hover:text-indigo-600 transition-colors">
                  Revenue Forecasting
                </Link>
              </li>
            </ul>
          </div>

          {/* Pillar 3: Close Column */}
          <div className="space-y-3">
            <p className="text-xs font-black text-slate-900 uppercase tracking-wider">
              {closePillar?.title || "Close"}
            </p>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <Link href="/transactions?tab=contracts" className="hover:text-indigo-600 transition-colors">
                  PDF Legal Contracts
                </Link>
              </li>
              <li>
                <Link href="/payments" className="hover:text-indigo-600 transition-colors">
                  Milestone Payments
                </Link>
              </li>
              <li>
                <Link href="/portal" className="hover:text-indigo-600 transition-colors">
                  Buyer Portal
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-indigo-600 transition-colors">
                  Client Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} BetFlow S.C. All rights reserved.</p>
          <div className="flex items-center gap-2 text-[11px] text-emerald-600 font-extrabold">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>All Systems Operational (NestJS + Prisma + PostgreSQL)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
