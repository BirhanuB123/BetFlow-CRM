export type SalesMetric = {
  label: string;
  value: string;
  detail: string;
};

export type AgentPerformance = {
  agent: string;
  leads: number;
  visits: number;
  reservations: number;
  revenue: string;
  conversion: string;
};

export type RevenueRow = {
  period: string;
  booked: string;
  collected: string;
  outstanding: string;
  forecast: string;
};

export type InventoryRow = {
  project: string;
  totalUnits: number;
  available: number;
  reserved: number;
  sold: number;
  blocked: number;
};

export type ConversionRow = {
  stage: string;
  count: number;
  rate: string;
  dropOff: string;
};

export type PaymentAgingRow = {
  bucket: string;
  invoices: number;
  amount: string;
  risk: "Low" | "Medium" | "High";
};

export const salesDashboardMetrics: SalesMetric[] = [
  {
    label: "Booked revenue",
    value: "$4.2M",
    detail: "Across active reservations",
  },
  { label: "Collected", value: "$1.1M", detail: "26% of booked revenue" },
  { label: "Open pipeline", value: "$7.8M", detail: "Weighted at $3.9M" },
  { label: "Conversion", value: "18.4%", detail: "Lead to reservation" },
];

export const agentPerformance: AgentPerformance[] = [
  {
    agent: "Maya Johnson",
    leads: 18,
    visits: 9,
    reservations: 4,
    revenue: "$2.4M",
    conversion: "22%",
  },
  {
    agent: "Omar Haddad",
    leads: 24,
    visits: 12,
    reservations: 5,
    revenue: "$1.8M",
    conversion: "21%",
  },
  {
    agent: "Noah Smith",
    leads: 16,
    visits: 8,
    reservations: 2,
    revenue: "$920K",
    conversion: "13%",
  },
];

export const revenueReport: RevenueRow[] = [
  {
    period: "June 2026",
    booked: "$1.9M",
    collected: "$720K",
    outstanding: "$1.18M",
    forecast: "$2.3M",
  },
  {
    period: "July 2026",
    booked: "$1.4M",
    collected: "$280K",
    outstanding: "$1.12M",
    forecast: "$2.7M",
  },
  {
    period: "August 2026",
    booked: "$900K",
    collected: "$100K",
    outstanding: "$800K",
    forecast: "$2.1M",
  },
];

export const inventoryReport: InventoryRow[] = [
  {
    project: "Harbor Point",
    totalUnits: 184,
    available: 47,
    reserved: 18,
    sold: 104,
    blocked: 15,
  },
  {
    project: "Meridian Residences",
    totalUnits: 96,
    available: 22,
    reserved: 9,
    sold: 58,
    blocked: 7,
  },
  {
    project: "District 7 Offices",
    totalUnits: 58,
    available: 58,
    reserved: 0,
    sold: 0,
    blocked: 0,
  },
];

export const conversionReport: ConversionRow[] = [
  { stage: "Lead captured", count: 248, rate: "100%", dropOff: "0%" },
  { stage: "Qualified", count: 142, rate: "57%", dropOff: "43%" },
  { stage: "Site visit", count: 76, rate: "31%", dropOff: "46%" },
  { stage: "Reservation", count: 46, rate: "18%", dropOff: "39%" },
  { stage: "Contract signed", count: 32, rate: "13%", dropOff: "30%" },
];

export const paymentAgingReport: PaymentAgingRow[] = [
  { bucket: "Current", invoices: 12, amount: "$680K", risk: "Low" },
  { bucket: "1-15 days", invoices: 5, amount: "$240K", risk: "Medium" },
  { bucket: "16-30 days", invoices: 2, amount: "$95K", risk: "Medium" },
  { bucket: "31+ days", invoices: 1, amount: "$25K", risk: "High" },
];

export const riskClass = {
  Low: "bg-emerald-50 text-emerald-700",
  Medium: "bg-amber-50 text-amber-800",
  High: "bg-red-50 text-red-700",
};
