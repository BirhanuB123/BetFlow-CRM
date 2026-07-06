export type CreateContractInput = {
  customerId: string;
  unitId: string;
  dealId?: string | null;
  startDate: string;
  endDate?: string | null;
  totalAmt: number | string;
  status?: string;
};

export type UpdateContractInput = {
  customerId?: string;
  unitId?: string;
  dealId?: string | null;
  startDate?: string;
  endDate?: string | null;
  totalAmt?: number | string;
  status?: string;
};
