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
