"use client";

import { useState } from "react";
import { StickyNav } from "@/components/marketing/StickyNav";
import { Hero } from "@/components/marketing/Hero";
import { TrustBar } from "@/components/marketing/TrustBar";
import { LiveWorkspacePreview } from "@/components/marketing/LiveWorkspacePreview";
import { ShowcaseCards } from "@/components/marketing/ShowcaseCards";
import { SocialProof } from "@/components/marketing/SocialProof";
import { CtaBanner } from "@/components/marketing/CtaBanner";
import { Footer } from "@/components/marketing/Footer";

export default function Home() {
  const [activeTab, setActiveTab] = useState<
    "leads" | "units" | "pipeline" | "visits" | "payments"
  >("leads");

  const [selectedWorkflows, setSelectedWorkflows] = useState<
    Record<string, boolean>
  >({
    leads: true,
    units: true,
    pipeline: true,
    visits: true,
    payments: true,
    contracts: true,
  });

  const toggleWorkflow = (key: string) => {
    setSelectedWorkflows((prev) => ({ ...prev, [key]: true }));

    const tabMap: Record<string, typeof activeTab> = {
      leads: "leads",
      units: "units",
      pipeline: "pipeline",
      visits: "visits",
      payments: "payments",
      contracts: "payments",
    };

    if (tabMap[key]) {
      setActiveTab(tabMap[key]);
    }

    const previewSection = document.getElementById("workspace-preview");
    if (previewSection) {
      previewSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-[#233b66] selection:text-white">
      <StickyNav />
      <Hero
        selectedWorkflows={selectedWorkflows}
        onToggleWorkflow={toggleWorkflow}
      />
      <TrustBar />
      <LiveWorkspacePreview
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <ShowcaseCards />
      <SocialProof />
      <CtaBanner />
      <Footer />
    </main>
  );
}
