import { deals, pipelineStages } from "@/features/leads/crm-data";

export function PipelineBoard() {
  return (
    <div className="grid gap-4 overflow-x-auto xl:grid-cols-5">
      {pipelineStages.map((stage) => {
        const stageDeals = deals.filter((deal) => deal.stage === stage);

        return (
          <section key={stage} className="min-w-64 rounded-lg border border-zinc-200 bg-white">
            <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
              <h2 className="text-sm font-semibold">{stage}</h2>
              <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium">
                {stageDeals.length}
              </span>
            </div>
            <div className="grid gap-3 p-3">
              {stageDeals.length > 0 ? (
                stageDeals.map((deal) => (
                  <article key={deal.id} className="rounded-md border border-zinc-200 p-3">
                    <p className="text-sm font-semibold">{deal.customer}</p>
                    <p className="mt-1 text-sm text-zinc-500">{deal.property}</p>
                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className="font-medium">{deal.value}</span>
                      <span className="text-zinc-500">{deal.probability}%</span>
                    </div>
                    <div className="mt-3 h-1.5 rounded-full bg-zinc-100">
                      <div
                        className="h-1.5 rounded-full bg-zinc-950"
                        style={{ width: `${deal.probability}%` }}
                      />
                    </div>
                    <p className="mt-3 text-xs text-zinc-500">{deal.owner} · {deal.closeDate}</p>
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
