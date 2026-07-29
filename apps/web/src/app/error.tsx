"use client";

import { ConnectionErrorDisplay } from "@/components/ui/connection-error-display";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ConnectionErrorDisplay
      url={typeof window !== "undefined" ? window.location.href : "http://localhost:3001/auth"}
      errorCode={error.digest ? `ERR_${error.digest.slice(0, 8)}` : "ERR_CONNECTION_REFUSED (-102)"}
      errorMessage={error.message || "Failed to load page. The connection to the server was interrupted or refused."}
      onRetry={reset}
    />
  );
}
