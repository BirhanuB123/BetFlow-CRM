import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Noto_Sans_Ethiopic } from "next/font/google";
import { ToastProvider } from "@/components/ui/toast";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { LanguageProvider } from "@/lib/i18n/language-context";
import { BrandingProvider } from "@/lib/branding-context";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const notoSansEthiopic = Noto_Sans_Ethiopic({
  subsets: ["ethiopic"],
  variable: "--font-noto-ethiopic",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BetFlow CRM",
  description: "Tenant-first real estate CRM dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`h-full antialiased ${plusJakartaSans.variable} ${notoSansEthiopic.variable}`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <ErrorBoundary>
          <LanguageProvider>
            <BrandingProvider>
              <ToastProvider>{children}</ToastProvider>
            </BrandingProvider>
          </LanguageProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
