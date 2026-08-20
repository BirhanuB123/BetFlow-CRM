"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useBranding } from "@/lib/branding-context";
import { useTranslation } from "@/lib/i18n/language-context";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { ArrowRight, KeyRound, Menu, X } from "lucide-react";

export function StickyNav() {
  const { t } = useTranslation();
  const { systemName } = useBranding();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2.5 group">
          <Image
            src="/betflow-mark.svg"
            alt={systemName}
            width={34}
            height={34}
            className="rounded-lg shadow-sm transition-transform group-hover:scale-105 bg-white p-0.5"
            priority
          />
          <div className="flex shrink-0 items-center gap-2">
            <span className="text-xl font-black text-white tracking-tight">
              {systemName}
            </span>
            <span className="shrink-0 rounded-md bg-indigo-600/30 border border-indigo-500/40 px-2 py-0.5 text-[10px] font-extrabold text-indigo-300 uppercase tracking-wider">
              CRM OS
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-6 xl:gap-8 text-xs font-bold text-slate-300 lg:flex">
          <Link
            href="/dashboard"
            className="hover:text-indigo-400 transition-colors"
          >
            {t("nav.dashboard")}
          </Link>
          <Link
            href="/pipeline?tab=leads"
            className="hover:text-indigo-400 transition-colors"
          >
            {t("nav.leadIntake")}
          </Link>
          <Link
            href="/units"
            className="hover:text-indigo-400 transition-colors"
          >
            {t("nav.stackingMatrix")}
          </Link>
          <Link
            href="/transactions?tab=contracts"
            className="hover:text-indigo-400 transition-colors"
          >
            {t("nav.contractsPdf")}
          </Link>
          <Link
            href="/portal"
            className="hover:text-indigo-400 transition-colors"
          >
            {t("nav.buyerPortal")}
          </Link>
        </nav>

        {/* Action CTAs & Language Switcher & Mobile Toggle */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <LanguageSwitcher variant="dark" />

          <Link
            href="/auth"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <KeyRound className="size-3.5 text-indigo-400" />
            <span>Sign In</span>
          </Link>

          <Link
            href="/dashboard"
            className="hidden sm:inline-flex group items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-extrabold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500 active:scale-[0.98] transition-all cursor-pointer"
          >
            <span>Start Free Trial</span>
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
          </Link>

          {/* Mobile / Tablet Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="inline-flex lg:hidden items-center justify-center rounded-lg border border-slate-800 bg-slate-900 p-2 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="size-5 text-slate-200" />
            ) : (
              <Menu className="size-5 text-slate-200" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile & Tablet Navigation Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-800 bg-slate-950/98 px-4 py-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-1">
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold text-slate-200 hover:bg-indigo-600/20 hover:text-indigo-300 transition-colors"
            >
              {t("nav.dashboard")}
            </Link>
            <Link
              href="/pipeline?tab=leads"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold text-slate-200 hover:bg-indigo-600/20 hover:text-indigo-300 transition-colors"
            >
              {t("nav.leadIntake")}
            </Link>
            <Link
              href="/units"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold text-slate-200 hover:bg-indigo-600/20 hover:text-indigo-300 transition-colors"
            >
              {t("nav.stackingMatrix")}
            </Link>
            <Link
              href="/transactions?tab=contracts"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold text-slate-200 hover:bg-indigo-600/20 hover:text-indigo-300 transition-colors"
            >
              {t("nav.contractsPdf")}
            </Link>
            <Link
              href="/portal"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold text-slate-200 hover:bg-indigo-600/20 hover:text-indigo-300 transition-colors"
            >
              {t("nav.buyerPortal")}
            </Link>
          </nav>

          <div className="pt-2 border-t border-slate-800 flex flex-col gap-2.5">
            <Link
              href="/auth"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 rounded-lg border border-slate-800 bg-slate-900 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer w-full"
            >
              <KeyRound className="size-4 text-indigo-400" />
              <span>Sign In</span>
            </Link>

            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-xs font-extrabold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500 transition-all cursor-pointer w-full text-center"
            >
              <span>Start Free Trial</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
