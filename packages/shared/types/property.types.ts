/**
 * Shared property & real estate types used by both apps/api and apps/web.
 * Extracted from apps/api/src/properties/properties.types.ts
 */

// ─── Input Types (API) ─────────────────────────────────────────────────────────

export type CreateBuildingInput = {
  projectId: string;
  name: string;
  floorsCount?: number;
};

export type UpdateBuildingInput = {
  name?: string;
  floorsCount?: number;
};

export type CreateFloorInput = {
  buildingId: string;
  floorNumber: number;
  name?: string | null;
};

export type UpdateFloorInput = {
  floorNumber?: number;
  name?: string | null;
};

// ─── Stacking Plan & Inventory Visualizer Types ───────────────────────────────

export type UnitStatus = 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'BLOCKED';

export type StackingPlanUnit = {
  id: string;
  unitNumber: string;
  type: string;
  status: UnitStatus;
  price: number | string;
  area: number | null;
};

export type StackingPlanFloor = {
  id: string;
  floorNumber: number;
  name: string | null;
  units: StackingPlanUnit[];
};

export type StackingPlanBuilding = {
  id: string;
  name: string;
  floors: StackingPlanFloor[];
};
