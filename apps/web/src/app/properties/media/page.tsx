import { ImageIcon } from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { projects, propertyMedia } from "@/features/properties/inventory-data";

const mediaClass = {
  Photo: "bg-blue-50 text-blue-700",
  "Floor plan": "bg-emerald-50 text-emerald-700",
  Document: "bg-zinc-100 text-zinc-700",
  "Virtual tour": "bg-violet-50 text-violet-700",
};

export default function PropertyMediaPage() {
  return (
    <DashboardShell
      title="Property media"
      description="Sales assets, floor plans, documents, and virtual tours."
      active="Media"
    >
      <section className="rounded-lg border border-zinc-200 bg-white p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold">Media library</h2>
            <p className="text-sm text-zinc-500">
              Attach approved media to projects and sales packets.
            </p>
          </div>
          <Button>
            <ImageIcon className="size-4" />
            Upload
          </Button>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {propertyMedia.map((media) => {
            const project = projects.find(
              (item) => item.id === media.projectId,
            );

            return (
              <article
                key={media.id}
                className="rounded-lg border border-zinc-200"
              >
                <div className="flex aspect-video items-center justify-center rounded-t-lg bg-zinc-100">
                  <ImageIcon className="size-8 text-zinc-400" />
                </div>
                <div className="p-4">
                  <span
                    className={`rounded-md px-2 py-1 text-xs font-medium ${mediaClass[media.type]}`}
                  >
                    {media.type}
                  </span>
                  <h3 className="mt-3 text-sm font-semibold">{media.title}</h3>
                  <p className="mt-1 text-sm text-zinc-500">
                    {project?.name ?? "Unknown project"}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
                    <span>{media.usage}</span>
                    <span>{media.updatedAt}</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </DashboardShell>
  );
}
