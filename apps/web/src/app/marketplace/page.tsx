import { EnterprisePage } from "@/features/enterprise/enterprise-page";
import { enterpriseCapabilities } from "@/features/enterprise/enterprise-data";

export default function MarketplacePage() {
  return (
    <EnterprisePage capability={enterpriseCapabilities["api-marketplace"]} />
  );
}
