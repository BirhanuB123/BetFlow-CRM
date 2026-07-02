import { EnterprisePage } from "@/features/enterprise/enterprise-page";
import { enterpriseCapabilities } from "@/features/enterprise/enterprise-data";

export default function CustomerPortalPage() {
  return <EnterprisePage capability={enterpriseCapabilities["customer-portal"]} />;
}
