"use client";

import Image from "next/image";

type ClientLogo = {
  id: string;
  name: string;
  logoUrl: string;
};

/**
 * Verified Real Client & Partner Logos
 * 
 * GROUND RULE: Keep this array empty until at least 3 verified real client logos exist.
 * Never populate with fabricated, placeholder, or unverified partner logos.
 */
const REAL_CLIENT_LOGOS: ClientLogo[] = [
  // TODO: Add verified real logos when client assets arrive (e.g. Ghion Homes, AIT Real Estate)
];

export function TrustBar() {
  // If fewer than 3 real client logos are available, do not render the trust strip.
  if (REAL_CLIENT_LOGOS.length < 3) {
    return null;
  }

  return (
    <section className="py-8 bg-slate-100 border-y border-slate-200 text-slate-700">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <p className="text-center text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-6">
          Trusted by Ethiopia's Premier Real Estate Developers & Brokerages
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 opacity-80 grayscale hover:grayscale-0 transition-all">
          {REAL_CLIENT_LOGOS.map((client) => (
            <div key={client.id} className="relative h-8 w-32 flex items-center justify-center">
              <Image
                src={client.logoUrl}
                alt={client.name}
                fill
                className="object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
