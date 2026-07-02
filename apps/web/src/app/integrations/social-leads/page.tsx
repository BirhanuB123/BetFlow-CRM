import { EnterprisePage } from "@/features/enterprise/enterprise-page";
import { enterpriseCapabilities } from "@/features/enterprise/enterprise-data";

export default function SocialLeadsPage() {
  return <EnterprisePage capability={enterpriseCapabilities["social-leads"]} />;
}
