import { EnterprisePage } from "@/features/enterprise/enterprise-page";
import { enterpriseCapabilities } from "@/features/enterprise/enterprise-data";

export default function ContractBuilderPage() {
  return <EnterprisePage capability={enterpriseCapabilities["contract-builder"]} />;
}
