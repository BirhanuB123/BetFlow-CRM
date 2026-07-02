import { ResourceContentPage } from "@/features/go-to-market/resource-page";
import { resourcePages } from "@/features/go-to-market/go-to-market-data";

export default function ProposalTemplatePage() {
  return <ResourceContentPage page={resourcePages["proposal-template"]} />;
}
