"use client";

import Link from "next/link";
import Image from "next/image";
import { VALUE_PILLARS } from "@/features/go-to-market/value-pillars";
import {
  CheckCircle2,
  Grid,
  CalendarDays,
  FileSignature,
  ArrowRight,
} from "lucide-react";

export function ShowcaseCards() {
  const icons = {
    organize: Grid,
    engage: CalendarDays,
    close: FileSignature,
  };

  return (
    <section className="py-20 bg-slate-900 border-t border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-24">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-extrabold text-indigo-300 uppercase tracking-wider">
            Three Core Real Estate Sales Pillars
          </span>
          <h2 className="text-3xl font-black text-white sm:text-4xl lg:text-5xl tracking-tight">
            Built for how top real estate teams actually sell
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            From buyer lead intake to signed contracts and milestone payments — organized around three core pillars.
          </p>
        </div>

        {/* 3 Pillar Showcases */}
        <div className="space-y-20">
          {VALUE_PILLARS.map((pillar, idx) => {
            const Icon = icons[pillar.id];
            const isEven = idx % 2 === 0;

            return (
              <div
                key={pillar.id}
                className={`grid lg:grid-cols-12 gap-10 items-center ${
                  isEven ? "" : "lg:grid-flow-dense"
                }`}
              >
                {/* Text & Features Column */}
                <div
                  className={`space-y-5 ${
                    isEven
                      ? "lg:col-span-6"
                      : "lg:col-span-6 lg:col-start-7"
                  }`}
                >
                  <div className="inline-flex items-center gap-2 rounded-lg bg-indigo-600/20 border border-indigo-500/30 px-3 py-1 text-xs font-bold text-indigo-300">
                    <Icon className="size-4 text-indigo-400" />
                    <span>{pillar.badge}</span>
                  </div>

                  <div>
                    <h3 className="text-2xl sm:text-3xl font-black text-white">
                      {pillar.title}: <span className="text-slate-300 font-bold">{pillar.subtitle}</span>
                    </h3>
                    <p className="text-sm font-semibold text-indigo-400 mt-1">
                      {pillar.tagline}
                    </p>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {pillar.description}
                  </p>

                  {/* Bullet Benefits */}
                  <ul className="space-y-2.5 pt-2">
                    {pillar.features.map((feature, fIdx) => (
                      <li
                        key={fIdx}
                        className="flex items-start gap-2.5 text-xs text-slate-300 font-medium"
                      >
                        <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Action Links */}
                  <div className="flex flex-wrap gap-3 pt-3">
                    {pillar.moduleLinks.map((link, lIdx) => (
                      <Link
                        key={lIdx}
                        href={link.href}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-300 hover:text-white bg-indigo-950/60 border border-indigo-800/60 rounded-lg px-3 py-1.5 transition-colors"
                      >
                        <span>{link.label}</span>
                        <ArrowRight className="size-3 text-indigo-400" />
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Screenshot / Card Visual Column */}
                <div
                  className={`lg:col-span-6 ${
                    isEven ? "" : "lg:col-start-1"
                  }`}
                >
                  <div className="relative rounded-2xl border border-slate-800 bg-slate-950 p-3 shadow-xl overflow-hidden group">
                    <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-slate-900">
                      <Image
                        src={pillar.imageSrc}
                        alt={pillar.imageAlt}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                      <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-slate-950/90 backdrop-blur-md border border-slate-800 text-xs">
                        <span className="rounded bg-indigo-600/30 border border-indigo-500/40 px-2 py-0.5 text-[10px] font-extrabold text-indigo-300 uppercase">
                          {pillar.title} Pillar Showcase
                        </span>
                        <h4 className="text-sm font-extrabold text-white mt-1">
                          {pillar.subtitle}
                        </h4>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
