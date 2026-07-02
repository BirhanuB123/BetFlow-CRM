import { EnterprisePage } from "@/features/enterprise/enterprise-page";
import { enterpriseCapabilities } from "@/features/enterprise/enterprise-data";

export default function MobilePwaPage() {
  return <EnterprisePage capability={enterpriseCapabilities["mobile-pwa"]} />;
}
