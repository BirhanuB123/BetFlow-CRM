import { FilePlus2 } from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CrmTable } from "@/components/tables/crm-table";
import { Button } from "@/components/ui/button";
import { reservationStatusClass, reservations } from "@/features/payments/sales-workflow-data";

export default function ReservationsPage() {
  return (
    <DashboardShell
      title="Reservations"
      description="Reserve units, track deposits, and prevent inventory conflicts."
      active="Reservations"
    >
      <section className="rounded-lg border border-zinc-200 bg-white">
        <div className="flex items-center justify-between gap-4 border-b border-zinc-200 p-4">
          <div>
            <h2 className="text-base font-semibold">Reservation queue</h2>
            <p className="text-sm text-zinc-500">Drafts, pending deposits, and confirmed reservations.</p>
          </div>
          <Button>
            <FilePlus2 className="size-4" />
            New reservation
          </Button>
        </div>
        <CrmTable
          columns={["Customer", "Unit", "Deposit", "Expires", "Status", "Owner"]}
          rows={reservations.map((reservation) => [
            <span key="customer" className="font-medium">{reservation.customer}</span>,
            reservation.unit,
            reservation.deposit,
            reservation.expiresAt,
            <span key="status" className={`rounded-md px-2 py-1 text-xs font-medium ${reservationStatusClass[reservation.status]}`}>
              {reservation.status}
            </span>,
            reservation.owner,
          ])}
        />
      </section>
    </DashboardShell>
  );
}
