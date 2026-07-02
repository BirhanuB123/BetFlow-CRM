import { ResourceContentPage } from "@/features/go-to-market/resource-page";
import { resourcePages } from "@/features/go-to-market/go-to-market-data";

export default function SupportProcessPage() {
  return <ResourceContentPage page={resourcePages["support-process"]} />;
}
