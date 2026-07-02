import { EnterprisePage } from "@/features/enterprise/enterprise-page";
import { enterpriseCapabilities } from "@/features/enterprise/enterprise-data";

export default function ForecastingPage() {
  return <EnterprisePage capability={enterpriseCapabilities["sales-forecasting"]} />;
}
