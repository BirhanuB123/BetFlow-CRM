import { EnterprisePage } from "@/features/enterprise/enterprise-page";
import { enterpriseCapabilities } from "@/features/enterprise/enterprise-data";

export default function WebsiteLeadsPage() {
  return <EnterprisePage capability={enterpriseCapabilities["website-leads"]} />;
}
