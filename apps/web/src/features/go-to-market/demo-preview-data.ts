export type LeadItem = {
  id: string;
  firstName: string;
  lastName: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  status: string;
  createdAt: string;
  source: { id: string; name: string } | null;
};

export type UnitItem = {
  id: string;
  unitNumber: string;
  type: string;
  status: string;
  price: string | number;
  area: number | null;
  floor?: {
    floorNumber: number;
    building?: { name: string; project?: { name: string } };
  };
};

export type StackingBuilding = {
  id: string;
  name: string;
  floors: {
    id: string;
    floorNumber: number;
    name: string | null;
    units: UnitItem[];
  }[];
};

export type DealItem = {
  id: string;
  name: string;
  value: string;
  stage: { id: string; name: string };
  customer: { id: string; firstName: string; lastName: string };
  unit: { id: string; unitNumber: string } | null;
};

export type ForecastStage = {
  stageId: string;
  stageName: string;
  probability: number;
  dealCount: number;
  rawVolume: number;
  weightedVolume: number;
};

export type SiteVisitItem = {
  id: string;
  date: string;
  status: string;
  notes: string | null;
  lead?: { id: string; firstName: string; lastName: string } | null;
  customer?: { id: string; firstName: string; lastName: string } | null;
};

export type PaymentScheduleItem = {
  id: string;
  milestoneName: string;
  percentage: number;
  amount: string;
  paidAmount: string;
  status: string;
  contract?: {
    customer?: { firstName: string; lastName: string };
    unit?: { unitNumber: string };
  };
};

export const demoLeads: LeadItem[] = [
  {
    id: "demo-lead-1",
    firstName: "Abebe",
    lastName: "Tadesse",
    company: "Abyssinia Capital Ltd",
    email: "abebe.tadesse@example.com",
    phone: "+251 91 123 4567",
    status: "QUALIFIED",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    source: { id: "s-1", name: "Website Portal" },
  },
  {
    id: "demo-lead-2",
    firstName: "Hellen",
    lastName: "Worku",
    company: "Zemen Holdings",
    email: "hellen.w@example.com",
    phone: "+251 92 876 5432",
    status: "CONTACTED",
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    source: { id: "s-2", name: "Social Ad Campaign" },
  },
  {
    id: "demo-lead-3",
    firstName: "Samuel",
    lastName: "Bekele",
    company: null,
    email: "samuel.bekele@example.com",
    phone: "+251 94 333 2211",
    status: "NEW",
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    source: { id: "s-3", name: "Direct Referral" },
  },
  {
    id: "demo-lead-4",
    firstName: "Tigist",
    lastName: "Haile",
    company: "Blue Nile Ventures",
    email: "tigist.h@example.com",
    phone: "+251 91 555 9988",
    status: "PROPOSAL_SENT",
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    source: { id: "s-1", name: "Website Portal" },
  },
  {
    id: "demo-lead-5",
    firstName: "Dawit",
    lastName: "Mulugeta",
    company: null,
    email: "dawit.m@example.com",
    phone: "+251 93 444 7766",
    status: "NEGOTIATION",
    createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
    source: { id: "s-4", name: "Property Expo 2026" },
  },
  {
    id: "demo-lead-6",
    firstName: "Meron",
    lastName: "Girma",
    company: "Apex Tech",
    email: "meron.girma@example.com",
    phone: "+251 91 888 2233",
    status: "WON",
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    source: { id: "s-3", name: "Direct Referral" },
  },
];

export const demoUnits: UnitItem[] = [
  {
    id: "demo-u-101",
    unitNumber: "A-101",
    type: "2BR Luxury Penthouse",
    status: "AVAILABLE",
    price: 18500000,
    area: 145,
    floor: { floorNumber: 1, building: { name: "Tower Alpha", project: { name: "Grand Pinnacle Residence" } } },
  },
  {
    id: "demo-u-102",
    unitNumber: "A-102",
    type: "3BR Executive Suite",
    status: "RESERVED",
    price: 24000000,
    area: 190,
    floor: { floorNumber: 1, building: { name: "Tower Alpha", project: { name: "Grand Pinnacle Residence" } } },
  },
  {
    id: "demo-u-201",
    unitNumber: "A-201",
    type: "1BR Studio Flat",
    status: "SOLD",
    price: 9800000,
    area: 78,
    floor: { floorNumber: 2, building: { name: "Tower Alpha", project: { name: "Grand Pinnacle Residence" } } },
  },
  {
    id: "demo-u-202",
    unitNumber: "A-202",
    type: "2BR Standard Apartment",
    status: "AVAILABLE",
    price: 15200000,
    area: 120,
    floor: { floorNumber: 2, building: { name: "Tower Alpha", project: { name: "Grand Pinnacle Residence" } } },
  },
  {
    id: "demo-u-301",
    unitNumber: "B-301",
    type: "3BR Duplex Haven",
    status: "BLOCKED",
    price: 29500000,
    area: 230,
    floor: { floorNumber: 3, building: { name: "Tower Beta", project: { name: "Grand Pinnacle Residence" } } },
  },
  {
    id: "demo-u-302",
    unitNumber: "B-302",
    type: "2BR Corner Balcony",
    status: "AVAILABLE",
    price: 16800000,
    area: 135,
    floor: { floorNumber: 3, building: { name: "Tower Beta", project: { name: "Grand Pinnacle Residence" } } },
  },
];

export const demoStacking: StackingBuilding[] = [
  {
    id: "bldg-alpha",
    name: "Tower Alpha — Grand Pinnacle",
    floors: [
      {
        id: "fl-3",
        floorNumber: 3,
        name: "Floor 3 - Duplex Level",
        units: [
          { id: "u-301", unitNumber: "A-301", type: "3BR Duplex", status: "AVAILABLE", price: 28000000, area: 210 },
          { id: "u-302", unitNumber: "A-302", type: "3BR Duplex", status: "RESERVED", price: 28500000, area: 215 },
        ],
      },
      {
        id: "fl-2",
        floorNumber: 2,
        name: "Floor 2 - Executive Level",
        units: [
          { id: "u-201", unitNumber: "A-201", type: "2BR Premium", status: "SOLD", price: 17500000, area: 138 },
          { id: "u-202", unitNumber: "A-202", type: "2BR Premium", status: "AVAILABLE", price: 17900000, area: 140 },
        ],
      },
      {
        id: "fl-1",
        floorNumber: 1,
        name: "Floor 1 - Podium Level",
        units: [
          { id: "u-101", unitNumber: "A-101", type: "1BR Garden", status: "AVAILABLE", price: 11200000, area: 85 },
          { id: "u-102", unitNumber: "A-102", type: "1BR Garden", status: "BLOCKED", price: 11500000, area: 88 },
        ],
      },
    ],
  },
];

export const demoDeals: DealItem[] = [
  {
    id: "deal-1",
    name: "Abebe Tadesse — Penthouse A-101 Acquisition",
    value: "ETB 18,500,000",
    stage: { id: "stg-negotiation", name: "Contract Negotiation" },
    customer: { id: "cust-1", firstName: "Abebe", lastName: "Tadesse" },
    unit: { id: "u-101", unitNumber: "A-101" },
  },
  {
    id: "deal-2",
    name: "Hellen Worku — Unit A-102 Holding Deposit",
    value: "ETB 24,000,000",
    stage: { id: "stg-reservation", name: "Reservation Approved" },
    customer: { id: "cust-2", firstName: "Hellen", lastName: "Worku" },
    unit: { id: "u-102", unitNumber: "A-102" },
  },
  {
    id: "deal-3",
    name: "Tigist Haile — Commercial Space B-302",
    value: "ETB 16,800,000",
    stage: { id: "stg-proposal", name: "Proposal Sent" },
    customer: { id: "cust-4", firstName: "Tigist", lastName: "Haile" },
    unit: { id: "u-302", unitNumber: "B-302" },
  },
  {
    id: "deal-4",
    name: "Meron Girma — Signed Purchase Agreement A-201",
    value: "ETB 9,800,000",
    stage: { id: "stg-closed", name: "Closed Won" },
    customer: { id: "cust-6", firstName: "Meron", lastName: "Girma" },
    unit: { id: "u-201", unitNumber: "A-201" },
  },
];

export const demoForecast = {
  totalRawPipeline: 69100000,
  totalWeightedPipeline: 48370000,
  stages: [
    {
      stageId: "stg-lead",
      stageName: "Initial Lead Intake",
      probability: 0.2,
      dealCount: 5,
      rawVolume: 50000000,
      weightedVolume: 10000000,
    },
    {
      stageId: "stg-site-visit",
      stageName: "Site Visit Scheduled",
      probability: 0.4,
      dealCount: 3,
      rawVolume: 42000000,
      weightedVolume: 16800000,
    },
    {
      stageId: "stg-proposal",
      stageName: "Proposal Sent",
      probability: 0.6,
      dealCount: 2,
      rawVolume: 33600000,
      weightedVolume: 20160000,
    },
    {
      stageId: "stg-negotiation",
      stageName: "Contract Negotiation",
      probability: 0.85,
      dealCount: 2,
      rawVolume: 42500000,
      weightedVolume: 36125000,
    },
  ],
};

export const demoVisits: SiteVisitItem[] = [
  {
    id: "sv-1",
    date: new Date(Date.now() + 86400000 * 1).toISOString(),
    status: "SCHEDULED",
    notes: "Client requested architectural floor plans and financing options review.",
    lead: { id: "lead-1", firstName: "Abebe", lastName: "Tadesse" },
  },
  {
    id: "sv-2",
    date: new Date(Date.now() + 86400000 * 3).toISOString(),
    status: "CONFIRMED",
    notes: "VIP tour of Floor 3 duplex sample unit with sales director.",
    lead: { id: "lead-2", firstName: "Hellen", lastName: "Worku" },
  },
  {
    id: "sv-3",
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    status: "COMPLETED",
    notes: "Site tour completed. Lead expressed high interest in penthouse A-101.",
    customer: { id: "cust-3", firstName: "Samuel", lastName: "Bekele" },
  },
];

export const demoSchedules: PaymentScheduleItem[] = [
  {
    id: "ps-1",
    milestoneName: "1. Holding Deposit (10%)",
    percentage: 10,
    amount: "ETB 1,850,000",
    paidAmount: "ETB 1,850,000",
    status: "PAID",
    contract: {
      customer: { firstName: "Abebe", lastName: "Tadesse" },
      unit: { unitNumber: "A-101" },
    },
  },
  {
    id: "ps-2",
    milestoneName: "2. Foundation Completion (20%)",
    percentage: 20,
    amount: "ETB 3,700,000",
    paidAmount: "ETB 3,700,000",
    status: "PAID",
    contract: {
      customer: { firstName: "Abebe", lastName: "Tadesse" },
      unit: { unitNumber: "A-101" },
    },
  },
  {
    id: "ps-3",
    milestoneName: "3. Structure Superstructure (30%)",
    percentage: 30,
    amount: "ETB 5,550,000",
    paidAmount: "ETB 0",
    status: "DUE_SOON",
    contract: {
      customer: { firstName: "Abebe", lastName: "Tadesse" },
      unit: { unitNumber: "A-101" },
    },
  },
  {
    id: "ps-4",
    milestoneName: "4. Handover & Final Balance (40%)",
    percentage: 40,
    amount: "ETB 7,400,000",
    paidAmount: "ETB 0",
    status: "PENDING",
    contract: {
      customer: { firstName: "Abebe", lastName: "Tadesse" },
      unit: { unitNumber: "A-101" },
    },
  },
];
