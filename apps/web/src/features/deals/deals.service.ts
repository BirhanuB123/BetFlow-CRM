import { apiFetch } from "@/lib/api";
import type {
  Deal,
  CreateDealInput,
  UpdateDealInput,
  MoveDealStageInput,
} from "@betflow/shared";

/**
 * Service for interacting with the Deal / Pipeline API endpoints.
 */
export const dealsService = {
  /** Fetch all deals */
  async getDeals(): Promise<Deal[]> {
    return apiFetch<Deal[]>("/deals");
  },

  /** Fetch a single deal by ID */
  async getDealById(id: string): Promise<Deal> {
    return apiFetch<Deal>(`/deals/${id}`);
  },

  /** Create a new deal */
  async createDeal(input: CreateDealInput): Promise<Deal> {
    return apiFetch<Deal>("/deals", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  /** Update an existing deal */
  async updateDeal(id: string, input: UpdateDealInput): Promise<Deal> {
    return apiFetch<Deal>(`/deals/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },

  /** Move a deal to a new stage */
  async moveStage(id: string, input: MoveDealStageInput): Promise<Deal> {
    return apiFetch<Deal>(`/deals/${id}/stage`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },
};
