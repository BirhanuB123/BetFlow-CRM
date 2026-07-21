import { apiFetch } from "@/lib/api";
import type {
  Lead,
  CreateLeadInput,
  UpdateLeadInput,
  UpdateLeadStatusInput,
  ConvertLeadInput,
} from "@betflow/shared";

/**
 * Service for interacting with the Lead Management API endpoints.
 */
export const leadsService = {
  /** Fetch all leads */
  async getLeads(): Promise<Lead[]> {
    return apiFetch<Lead[]>("/leads");
  },

  /** Fetch a single lead by ID */
  async getLeadById(id: string): Promise<Lead> {
    return apiFetch<Lead>(`/leads/${id}`);
  },

  /** Create a new lead */
  async createLead(input: CreateLeadInput): Promise<Lead> {
    return apiFetch<Lead>("/leads", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  /** Update an existing lead */
  async updateLead(id: string, input: UpdateLeadInput): Promise<Lead> {
    return apiFetch<Lead>(`/leads/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },

  /** Update lead status */
  async updateStatus(id: string, input: UpdateLeadStatusInput): Promise<Lead> {
    return apiFetch<Lead>(`/leads/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },

  /** Convert a lead to account/contact/deal */
  async convertLead(id: string, input: ConvertLeadInput): Promise<unknown> {
    return apiFetch(`/leads/${id}/convert`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
};
