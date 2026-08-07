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
export type UnitStatus = "AVAILABLE" | "RESERVED" | "SOLD" | "BLOCKED";
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
export declare const ETHIOPIAN_CONSTRUCTION_STAGES: readonly [
  "FOUNDATION",
  "SUPERSTRUCTURE",
  "BLOCKWORK",
  "FINISHING",
  "HANDOVER",
];
export type ConstructionStageKey =
  (typeof ETHIOPIAN_CONSTRUCTION_STAGES)[number];
export type MilestoneStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
export type ConstructionMilestone = {
  id: string;
  buildingId: string;
  stageKey: ConstructionStageKey;
  stageNameAmharic: string;
  stageNameEnglish: string;
  completionPercent: number;
  status: MilestoneStatus;
  targetDate?: string | null;
  completedAt?: string | null;
  photoUrl?: string | null;
};
export type UpdateMilestoneProgressInput = {
  buildingId: string;
  stageKey: ConstructionStageKey;
  completionPercent: number;
  status: MilestoneStatus;
  photoUrl?: string;
  notes?: string;
};
export type MilestoneTriggerResult = {
  milestone: ConstructionMilestone;
  contractsTriggered: number;
  invoicesGenerated: number;
  notificationsSent: number;
};
