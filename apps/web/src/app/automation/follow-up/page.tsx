import { EnterprisePage } from "@/features/enterprise/enterprise-page";
import { enterpriseCapabilities } from "@/features/enterprise/enterprise-data";

export default function FollowUpAutomationPage() {
  return (
    <EnterprisePage
      capability={enterpriseCapabilities["follow-up-automation"]}
    />
  );
}
