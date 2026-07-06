export type CreateDealInput = {
  name: string;
  value: number | string;
  stageId: string;
  customerId: string;
  unitId?: string | null;
};

export type UpdateDealInput = {
  name?: string;
  value?: number | string;
  stageId?: string;
  customerId?: string;
  unitId?: string | null;
};

export type MoveDealStageInput = {
  stageId: string;
};