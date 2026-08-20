export type ValuePillar = {
  id: "organize" | "engage" | "close";
  title: string;
  subtitle: string;
  tagline: string;
  description: string;
  badge: string;
  features: string[];
  imageSrc: string;
  imageAlt: string;
  moduleLinks: { label: string; href: string }[];
};

export const VALUE_PILLARS: ValuePillar[] = [
  {
    id: "organize",
    title: "Organize",
    subtitle: "Centralize Leads & Unit Inventory",
    tagline: "Never lose a buyer lead or misplace unit availability",
    description:
      "Automatically capture buyer leads from social, web, and walk-ins. Manage floor-by-floor unit availability, pricing tiers, and reservation locks in one centralized stacking elevation view.",
    badge: "Pillar 1 · Structure & Inventory",
    features: [
      "Atomic Unit Reservation Locks (Zero Double-Booking)",
      "Floor-by-Floor Interactive Stacking Elevation Matrix",
      "Unified Buyer Lead & Diaspora Inquiries CRM",
    ],
    imageSrc: "/tower.png",
    imageAlt: "Organize - Stacking Elevation & Unit Inventory",
    moduleLinks: [
      { label: "Lead Intake Pipeline", href: "/pipeline?tab=leads" },
      { label: "Unit Stacking Elevation", href: "/units" },
    ],
  },
  {
    id: "engage",
    title: "Engage",
    subtitle: "Accelerate Buyer Response & Site Visits",
    tagline: "Move prospects from initial inquiry to scheduled site tour",
    description:
      "Automate follow-up reminders, log site visit feedback, and move buyers through visual Kanban pipeline stages with automated SMS and email notifications.",
    badge: "Pillar 2 · Speed & Pipeline",
    features: [
      "Site Visit Scheduler with Calendar Integration",
      "Visual Kanban Sales Pipeline & Stage Movement",
      "Automated Buyer Follow-up & Drip Reminders",
    ],
    imageSrc: "/interior.png",
    imageAlt: "Engage - Site Visit Scheduling & Pipeline",
    moduleLinks: [
      { label: "Site Visit Scheduler", href: "/site-visits" },
      { label: "Sales Kanban Pipeline", href: "/pipeline" },
    ],
  },
  {
    id: "close",
    title: "Close",
    subtitle: "Automate Contracts & Milestone Payments",
    tagline: "Lock in deals with instant legal contracts and deposit tracking",
    description:
      "Generate SHA-256 verified PDF sales agreements with mouse/touch signature pads. Track downpayments, milestone schedules, overdue penalties, and bank deposit slips.",
    badge: "Pillar 3 · Execution & Revenue",
    features: [
      "SHA-256 Verified PDF Contracts & Touch E-Signatures",
      "30% Downpayment & Construction Milestone Schedules",
      "Bank Transfer Receipt Approval & Audit Logging",
    ],
    imageSrc: "/interior.png",
    imageAlt: "Close - Contracts, E-Signatures & Payment Schedules",
    moduleLinks: [
      { label: "PDF Contract Builder", href: "/transactions?tab=contracts" },
      { label: "Milestone Payments", href: "/payments" },
    ],
  },
];
