import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type Deal = {
  id: string;
  value: string;
  probability: number;
  customer?: { firstName: string; lastName: string };
  property?: { title: string };
  assignedTo?: { firstName: string; lastName: string };
  createdAt: string;
  stageId: string;
};

type Stage = {
  id: string;
  name: string;
  order: number;
};

export function PipelineBoard() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [fetchedStages, fetchedDeals] = await Promise.all([
          apiFetch<Stage[]>("/deals/stages"),
          apiFetch<Deal[]>("/deals"),
        ]);
        setStages(fetchedStages.sort((a, b) => a.order - b.order));
        setDeals(fetchedDeals);
      } catch (error) {
        console.error("Failed to load pipeline data:", error);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  if (loading) {
    return <div className="p-4 text-sm text-zinc-500">Loading pipeline...</div>;
  }

  return (
    <div className="grid gap-4 overflow-x-auto xl:grid-cols-5">
      {stages.map((stage) => {
        const stageDeals = deals.filter((deal) => deal.stageId === stage.id);

        return (
          <section
            key={stage.id}
            className="min-w-64 rounded-lg border border-zinc-200 bg-white"
          >
            <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
              <h2 className="text-sm font-semibold">{stage.name}</h2>
              <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium">
                {stageDeals.length}
              </span>
            </div>
            <div className="grid gap-3 p-3">
              {stageDeals.length > 0 ? (
                stageDeals.map((deal) => (
                  <article
                    key={deal.id}
                    className="rounded-md border border-zinc-200 p-3"
                  >
                    <p className="text-sm font-semibold">
                      {deal.customer
                        ? `${deal.customer.firstName} ${deal.customer.lastName}`
                        : "Unknown Customer"}
                    </p>
                    <p className="mt-1 text-sm text-zinc-500">
                      {deal.property?.title || "No property"}
                    </p>
                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className="font-medium">
                        {Number(deal.value).toLocaleString("en-US", {
                          style: "currency",
                          currency: "USD",
                        })}
                      </span>
                      <span className="text-zinc-500">{deal.probability}%</span>
                    </div>
                    <div className="mt-3 h-1.5 rounded-full bg-zinc-100">
                      <div
                        className="h-1.5 rounded-full bg-zinc-950"
                        style={{ width: `${deal.probability}%` }}
                      />
                    </div>
                    <p className="mt-3 text-xs text-zinc-500">
                      {deal.assignedTo
                        ? `${deal.assignedTo.firstName} ${deal.assignedTo.lastName}`
                        : "Unassigned"}{" "}
                      · {new Date(deal.createdAt).toLocaleDateString()}
                    </p>
                  </article>
                ))
              ) : (
                <div className="rounded-md border border-dashed border-zinc-200 p-4 text-sm text-zinc-500">
                  No active deals
                </div>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
