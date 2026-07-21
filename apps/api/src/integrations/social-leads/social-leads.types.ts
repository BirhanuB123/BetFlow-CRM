/**
 * Meta (Facebook/Instagram) Lead Ads webhook payload shapes.
 * Reference: https://developers.facebook.com/docs/marketing-api/guides/lead-ads/
 */

export interface MetaLeadFieldData {
  name: string;   // e.g., "email", "phone_number", "full_name"
  values: string[];
}

export interface MetaLeadgenValue {
  ad_id: string;
  ad_name: string;
  adset_id: string;
  adset_name: string;
  campaign_id: string;
  campaign_name: string;
  created_time: number; // Unix epoch
  form_id: string;
  leadgen_id: string;
  page_id: string;
  field_data: MetaLeadFieldData[];
}

export interface MetaWebhookChange {
  field: string;         // "leadgen"
  value: MetaLeadgenValue;
}

export interface MetaWebhookEntry {
  id: string;            // page ID
  time: number;
  changes: MetaWebhookChange[];
}

export interface MetaWebhookPayload {
  object: string;        // "page"
  entry: MetaWebhookEntry[];
}
