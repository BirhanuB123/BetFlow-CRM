"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

type AccessRestrictedProps = {
  title?: string;
  description?: string;
  requiredPermission?: string;
};

export function AccessRestricted({
  title = "Access Restricted",
  description = "You do not have permission to view this section or perform actions on this resource.",
  requiredPermission,
}: AccessRestrictedProps) {
  return (
    <div className="flex min-h-[380px] w-full flex-col items-center justify-center rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-xs">
      <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/20 shadow-2xs">
        <Lock className="size-8" />
      </div>

      <h2 className="text-base font-extrabold text-slate-900 sm:text-lg">
        {title}
      </h2>

      <p className="mt-2 max-w-md text-xs font-medium text-slate-500 leading-relaxed sm:text-sm">
        {description}
      </p>

      {requiredPermission && (
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 border border-slate-200">
          <ShieldAlert className="size-3.5 text-amber-600" />
          <span>Required permission: <strong className="text-slate-900">{requiredPermission}</strong></span>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/dashboard"
          className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
        >
          Return to Dashboard
        </Link>

        <a
          href="mailto:admin@betflow.example?subject=Access%20Request"
          className="inline-flex h-9 items-center justify-center rounded-lg bg-[#233b66] hover:bg-[#182a4a] px-4 text-xs font-bold text-white transition-colors shadow-2xs"
        >
          <Mail className="mr-1.5 size-3.5" />
          Contact Workspace Admin
        </a>
      </div>
    </div>
  );
}
