import { EnterprisePage } from "@/features/enterprise/enterprise-page";
import { enterpriseCapabilities } from "@/features/enterprise/enterprise-data";

export default function ApprovalWorkflowsPage() {
  return <EnterprisePage capability={enterpriseCapabilities["approval-workflows"]} />;
}
