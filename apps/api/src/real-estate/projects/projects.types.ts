export const PROJECT_STATUSES = [
  'PLANNING',
  'ACTIVE',
  'SELLING',
  'COMPLETED',
  'ON_HOLD',
] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const PROJECT_CATEGORIES = [
  'RESIDENTIAL_TOWER',
  'LUXURY_VILLA_COMPOUND',
  'COMMERCIAL_PLAZA',
  'MIXED_USE_DEVELOPMENT',
  'TOWN_HOUSES',
] as const;

export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];

export const CONSTRUCTION_STAGES = [
  'EXCAVATION_FOUNDATION',
  'STRUCTURE_CONCRETE_SLAB',
  'BRICKWORK_PLASTERING',
  'FINISHING_TILING',
  'HANDOVER_READY',
] as const;

export type ConstructionStage = (typeof CONSTRUCTION_STAGES)[number];

export type CreateProjectInput = {
  name: string;
  description?: string | null;
  category?: string;
  location?: string | null;
  subCity?: string | null;
  constructionStage?: string;
  progressPercentage?: number;
  estimatedDelivery?: string | null;
  coverImage?: string | null;
  gallery?: string[];
  videoUrl?: string | null;
  amenities?: string[];
  totalAreaSqm?: number | null;
  avgPricePerSqm?: number | string | null;
  status?: string;
};

export type UpdateProjectInput = {
  name?: string;
  description?: string | null;
  category?: string;
  location?: string | null;
  subCity?: string | null;
  constructionStage?: string;
  progressPercentage?: number;
  estimatedDelivery?: string | null;
  coverImage?: string | null;
  gallery?: string[];
  videoUrl?: string | null;
  amenities?: string[];
  totalAreaSqm?: number | null;
  avgPricePerSqm?: number | string | null;
  status?: string;
};
