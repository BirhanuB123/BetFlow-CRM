/**
 * Website lead capture payload.
 * Validated manually in the service to avoid needing class-validator.
 */
export interface WebsiteLeadCaptureDto {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  company?: string;
  /** Freeform notes/message from a contact form */
  message?: string;
  /** UTM / referrer tracking */
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}
