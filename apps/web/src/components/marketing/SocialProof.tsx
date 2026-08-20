"use client";

import Image from "next/image";
import { Quote } from "lucide-react";

type VerifiedTestimonial = {
  id: string;
  quote: string;
  authorName: string;
  authorTitle: string;
  companyName: string;
  avatarUrl?: string;
  statHighlight?: {
    value: string;
    label: string;
  };
};

/**
 * Verified Real Customer Testimonials & Case Study Metrics
 * 
 * GROUND RULE: Keep this array empty until real, verified customer quotes
 * and audited metrics (e.g. from Ghion Homes, AIT Real Estate) are confirmed.
 * NEVER populate with fabricated quotes, names, or statistics.
 */
const VERIFIED_TESTIMONIALS: VerifiedTestimonial[] = [
  // TODO: Insert real verified client testimonials when approved (e.g. Ghion Homes / AIT Real Estate)
  // Example structure once verified:
  // {
  //   id: "ghion-homes",
  //   quote: "BetFlow CRM streamlined our unit reservations and contract signing for our tower launch...",
  //   authorName: "Real Name",
  //   authorTitle: "Sales Director",
  //   companyName: "Ghion Homes S.C.",
  //   statHighlight: { value: "3x", label: "Faster Unit Locks" },
  // },
];

export function SocialProof() {
  // Ground rule: Gate rendering behind a check. If no real verified testimonials exist, return null.
  if (VERIFIED_TESTIMONIALS.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-slate-100 border-t border-slate-200 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-xs font-extrabold text-indigo-700 uppercase tracking-wider">
            Verified Customer Results
          </span>
          <h2 className="text-3xl font-black text-slate-900 sm:text-4xl">
            Trusted by top real estate development leaders
          </h2>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto">
          {VERIFIED_TESTIMONIALS.map((item) => (
            <div
              key={item.id}
              className="lg:col-span-12 rounded-2xl border border-slate-200 bg-white p-8 shadow-lg space-y-6"
            >
              <Quote className="size-10 text-indigo-500 opacity-60" />
              <blockquote className="text-lg sm:text-xl font-bold text-slate-800 leading-relaxed italic">
                "{item.quote}"
              </blockquote>

              <div className="flex flex-wrap items-center justify-between border-t border-slate-100 pt-6 gap-4">
                <div className="flex items-center gap-4">
                  {item.avatarUrl ? (
                    <Image
                      src={item.avatarUrl}
                      alt={item.authorName}
                      width={48}
                      height={48}
                      className="rounded-full object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="size-12 rounded-full bg-indigo-100 text-indigo-700 font-black flex items-center justify-center text-base">
                      {item.authorName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h4 className="text-base font-extrabold text-slate-900">
                      {item.authorName}
                    </h4>
                    <p className="text-xs font-medium text-slate-500">
                      {item.authorTitle} • <span className="font-bold text-indigo-600">{item.companyName}</span>
                    </p>
                  </div>
                </div>

                {item.statHighlight && (
                  <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-2 text-right">
                    <p className="text-xl font-black text-indigo-600">
                      {item.statHighlight.value}
                    </p>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      {item.statHighlight.label}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
