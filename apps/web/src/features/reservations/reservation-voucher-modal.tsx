import {
  Building2,
  X,
  User,
  Building,
  Coins,
  CalendarDays,
  Banknote,
  Receipt,
  ShieldCheck,
  Printer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/currency";
import { formatDate as fmtDate } from "@/lib/date";
import { cn } from "@/lib/utils";

export type ApiReservation = {
  id: string;
  reservationNumber: string | null;
  amount: string;
  holdPeriodDays: number;
  expiryDate: string | null;
  paymentMethod: string | null;
  receiptNumber: string | null;
  status: string;
  date: string;
  notes: string | null;
  customer: { id: string; firstName: string; lastName: string };
  unit: {
    id: string;
    unitNumber: string;
    type: string;
    status: string;
    price: string;
  };
  _count: { payments: number };
};

const statusClass: Record<string, string> = {
  PENDING: "bg-warning/10 text-warning border-warning/20 font-medium",
  APPROVED: "bg-success/10 text-success border-success/20 font-bold",
  CONVERTED_TO_CONTRACT:
    "bg-primary/10 text-primary border-primary/20 font-bold",
  CANCELLED: "bg-destructive/10 text-destructive border-destructive/20",
  EXPIRED: "bg-slate-100 text-slate-600 border-slate-200",
};

const paymentMethodLabels: Record<string, string> = {
  BANK_TRANSFER: "CBE / Bank Transfer (የባንክ ሐዋላ)",
  TELEBIRR: "Telebirr (ቴሌብር)",
  CBE_BIRR: "CBE Birr (ሲቢኢ ብር)",
  CASH_DEPOSIT: "Cash Deposit (በጥሬ ገንዘብ)",
  CHECK: "Check (በቼክ)",
};

interface ReservationVoucherModalProps {
  voucher: ApiReservation;
  onClose: () => void;
}

export function ReservationVoucherModal({
  voucher,
  onClose,
}: ReservationVoucherModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl transition-all">
        {/* Voucher Top Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Building2 className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Unit Reservation Voucher
              </h3>
              <p className="text-xs text-slate-400">
                Official BetFlow Holding Deposit & Inventory Lock
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Voucher Content */}
        <div className="mt-5 space-y-4 text-xs">
          {/* Header Banner */}
          <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-[#233b66]/10 via-primary/10/50 to-slate-50 p-4 border border-[#233b66]/10">
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Reservation Reference
              </p>
              <p className="text-base font-bold text-[#233b66] font-mono">
                {voucher.reservationNumber ??
                  `BF-RES-${voucher.id.slice(0, 8).toUpperCase()}`}
              </p>
            </div>
            <span
              className={cn(
                "px-3 py-1 rounded-full text-xs font-bold border shadow-2xs",
                statusClass[voucher.status],
              )}
            >
              {voucher.status}
            </span>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-100 p-3.5 bg-slate-50/60">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <User className="size-3 text-slate-400" />
                Buyer / Customer
              </p>
              <p className="mt-1 text-xs font-bold text-slate-900">
                {voucher.customer.firstName} {voucher.customer.lastName}
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 p-3.5 bg-slate-50/60">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Building className="size-3 text-slate-400" />
                Reserved Inventory
              </p>
              <p className="mt-1 text-xs font-bold text-slate-900">
                Unit {voucher.unit.unitNumber} ({voucher.unit.type})
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 p-3.5 bg-slate-50/60">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Coins className="size-3 text-success" />
                Deposit Paid (ETB)
              </p>
              <p className="mt-1 text-sm font-bold text-success">
                {formatCurrency(voucher.amount)}
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 p-3.5 bg-slate-50/60">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <CalendarDays className="size-3 text-warning" />
                Hold Expiration
              </p>
              <p className="mt-1 text-xs font-bold text-slate-900">
                {fmtDate(voucher.expiryDate)} ({voucher.holdPeriodDays} Days)
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 p-3.5 bg-slate-50/60">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Banknote className="size-3 text-slate-400" />
                Payment Method
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-800">
                {paymentMethodLabels[voucher.paymentMethod ?? ""] ??
                  "Bank Transfer"}
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 p-3.5 bg-slate-50/60">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Receipt className="size-3 text-slate-400" />
                Bank Receipt Ref
              </p>
              <p className="mt-1 text-xs font-mono font-bold text-slate-800">
                {voucher.receiptNumber ?? "N/A"}
              </p>
            </div>
          </div>

          {voucher.notes && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
              <p className="text-[11px] font-bold text-slate-700 mb-1">
                Reservation Terms & Special Notes
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">
                {voucher.notes}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between rounded-xl bg-slate-100/70 px-4 py-2 text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="size-3.5 text-success" />
              Official BetFlow CRM Property Lock Record
            </span>
            <span className="font-mono">
              Issued: {fmtDate(voucher.date)}
            </span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.print()}
            className="gap-1.5 text-xs text-slate-700 border-slate-300 hover:bg-slate-100"
          >
            <Printer className="size-3.5" />
            Print / Export Voucher
          </Button>

          <Button
            onClick={onClose}
            className="text-xs px-5"
          >
            Close Voucher
          </Button>
        </div>
      </div>
    </div>
  );
}
