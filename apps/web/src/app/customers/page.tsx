"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CustomersRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/pipeline?tab=customers");
  }, [router]);

  return (
    <div className="flex h-64 items-center justify-center text-xs font-semibold text-slate-500">
      Redirecting to Pipeline (Customers)...
    </div>
  );
}
