import { EnterprisePage } from "@/features/enterprise/enterprise-page";
import { enterpriseCapabilities } from "@/features/enterprise/enterprise-data";

export default function EmailCampaignsPage() {
  return <EnterprisePage capability={enterpriseCapabilities["email-campaigns"]} />;
}
