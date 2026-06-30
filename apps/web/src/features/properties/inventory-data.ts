export type ProjectStatus = "Planning" | "Active" | "Selling" | "Delivered";
export type UnitStatus = "Available" | "Reserved" | "Sold" | "Blocked";
export type MediaType = "Photo" | "Floor plan" | "Document" | "Virtual tour";

export type Project = {
  id: string;
  name: string;
  location: string;
  status: ProjectStatus;
  buildings: number;
  units: number;
  availableUnits: number;
  revenuePotential: string;
};

export type Building = {
  id: string;
  projectId: string;
  name: string;
  address: string;
  floors: number;
  units: number;
  availableUnits: number;
  status: "Pre-launch" | "Open" | "Limited" | "Closed";
};

export type Floor = {
  id: string;
  buildingId: string;
  label: string;
  units: number;
  availableUnits: number;
  releaseStatus: "Draft" | "Released" | "Hold";
};

export type Unit = {
  id: string;
  projectId: string;
  buildingId: string;
  floorId: string;
  unitNumber: string;
  type: "Studio" | "1BR" | "2BR" | "3BR" | "Retail";
  areaSqft: number;
  price: string;
  status: UnitStatus;
  availableFrom: string;
  exposure: "North" | "South" | "East" | "West";
};

export type PropertyMedia = {
  id: string;
  projectId: string;
  title: string;
  type: MediaType;
  usage: "Public" | "Internal" | "Sales packet";
  updatedAt: string;
};

export const projects: Project[] = [
  {
    id: "project_001",
    name: "Harbor Point",
    location: "Miami, FL",
    status: "Selling",
    buildings: 2,
    units: 184,
    availableUnits: 47,
    revenuePotential: "$126.4M",
  },
  {
    id: "project_002",
    name: "Meridian Residences",
    location: "Austin, TX",
    status: "Active",
    buildings: 1,
    units: 96,
    availableUnits: 22,
    revenuePotential: "$74.2M",
  },
  {
    id: "project_003",
    name: "District 7 Offices",
    location: "Charlotte, NC",
    status: "Planning",
    buildings: 3,
    units: 58,
    availableUnits: 58,
    revenuePotential: "$89.8M",
  },
];

export const buildings: Building[] = [
  {
    id: "building_001",
    projectId: "project_001",
    name: "Harbor Tower A",
    address: "210 Bayfront Ave",
    floors: 24,
    units: 112,
    availableUnits: 29,
    status: "Open",
  },
  {
    id: "building_002",
    projectId: "project_001",
    name: "Harbor Tower B",
    address: "214 Bayfront Ave",
    floors: 18,
    units: 72,
    availableUnits: 18,
    status: "Limited",
  },
  {
    id: "building_003",
    projectId: "project_002",
    name: "Meridian North",
    address: "88 Trinity St",
    floors: 16,
    units: 96,
    availableUnits: 22,
    status: "Open",
  },
];

export const floors: Floor[] = [
  { id: "floor_001", buildingId: "building_001", label: "Floor 18", units: 6, availableUnits: 2, releaseStatus: "Released" },
  { id: "floor_002", buildingId: "building_001", label: "Floor 19", units: 6, availableUnits: 3, releaseStatus: "Released" },
  { id: "floor_003", buildingId: "building_002", label: "Floor 12", units: 4, availableUnits: 1, releaseStatus: "Hold" },
  { id: "floor_004", buildingId: "building_003", label: "Floor 9", units: 8, availableUnits: 4, releaseStatus: "Released" },
];

export const units: Unit[] = [
  {
    id: "unit_001",
    projectId: "project_001",
    buildingId: "building_001",
    floorId: "floor_001",
    unitNumber: "A-1802",
    type: "2BR",
    areaSqft: 1240,
    price: "$1.18M",
    status: "Available",
    availableFrom: "Now",
    exposure: "East",
  },
  {
    id: "unit_002",
    projectId: "project_001",
    buildingId: "building_001",
    floorId: "floor_001",
    unitNumber: "A-1803",
    type: "3BR",
    areaSqft: 1680,
    price: "$1.74M",
    status: "Reserved",
    availableFrom: "Reservation expires Jul 5",
    exposure: "South",
  },
  {
    id: "unit_003",
    projectId: "project_001",
    buildingId: "building_002",
    floorId: "floor_003",
    unitNumber: "B-1201",
    type: "1BR",
    areaSqft: 840,
    price: "$780K",
    status: "Blocked",
    availableFrom: "Release review",
    exposure: "North",
  },
  {
    id: "unit_004",
    projectId: "project_002",
    buildingId: "building_003",
    floorId: "floor_004",
    unitNumber: "N-0905",
    type: "2BR",
    areaSqft: 1110,
    price: "$940K",
    status: "Available",
    availableFrom: "Now",
    exposure: "West",
  },
  {
    id: "unit_005",
    projectId: "project_002",
    buildingId: "building_003",
    floorId: "floor_004",
    unitNumber: "N-0906",
    type: "Retail",
    areaSqft: 2200,
    price: "$1.62M",
    status: "Sold",
    availableFrom: "Closed",
    exposure: "South",
  },
];

export const propertyMedia: PropertyMedia[] = [
  {
    id: "media_001",
    projectId: "project_001",
    title: "Harbor Point exterior gallery",
    type: "Photo",
    usage: "Public",
    updatedAt: "Today",
  },
  {
    id: "media_002",
    projectId: "project_001",
    title: "Tower A floor plans",
    type: "Floor plan",
    usage: "Sales packet",
    updatedAt: "Yesterday",
  },
  {
    id: "media_003",
    projectId: "project_002",
    title: "Meridian virtual walkthrough",
    type: "Virtual tour",
    usage: "Public",
    updatedAt: "Jun 28, 2026",
  },
  {
    id: "media_004",
    projectId: "project_003",
    title: "District 7 zoning packet",
    type: "Document",
    usage: "Internal",
    updatedAt: "Jun 24, 2026",
  },
];

export const statusClass: Record<UnitStatus, string> = {
  Available: "bg-emerald-50 text-emerald-700",
  Reserved: "bg-amber-50 text-amber-800",
  Sold: "bg-zinc-100 text-zinc-700",
  Blocked: "bg-red-50 text-red-700",
};
