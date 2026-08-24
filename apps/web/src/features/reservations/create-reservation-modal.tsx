import { type FormEvent } from "react";
import { Sparkles, Receipt, User, Building, Coins, CalendarDays, Banknote } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { OfflineDraftBanner } from "@/components/ui/offline-draft-banner";

export type CustomerOption = { id: string; firstName: string; lastName: string };
export type UnitOption = {
  id: string;
  unitNumber: string;
  type: string;
  price: string;
};

export type ReservationFormState = {
  reservationNumber: string;
  customerId: string;
  unitId: string;
  amount: string;
  holdPeriodDays: string;
  paymentMethod: string;
  receiptNumber: string;
  notes: string;
};

interface CreateReservationModalProps {
  form: ReservationFormState;
  setForm: (val: ReservationFormState) => void;
  onSubmit: (event: FormEvent) => void;
  customers: CustomerOption[];
  availableUnits: UnitOption[];
  saving: boolean;
  selectedUnitDetails: UnitOption | null;
  isOffline?: boolean;
  hasDraft?: boolean;
  onRestoreDraft?: () => void;
  onClearDraft?: () => void;
}

export function CreateReservationModal({
  form,
  setForm,
  onSubmit,
  customers,
  availableUnits,
  saving,
  selectedUnitDetails,
  isOffline,
  hasDraft,
  onRestoreDraft,
  onClearDraft,
}: CreateReservationModalProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="mt-6 rounded-xl border border-primary/20 bg-gradient-to-br from-[#233b66]/5 via-primary/10/30 to-slate-50/50 p-5 shadow-inner transition-all"
    >
      <OfflineDraftBanner
        isOffline={isOffline}
        hasDraft={hasDraft}
        onRestoreDraft={onRestoreDraft}
        onClearDraft={onClearDraft}
      />
      <div className="flex items-center justify-between border-b border-[#233b66]/10 pb-3 mb-4">
        <h3 className="text-xs font-bold text-[#233b66] uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="size-4 text-[#233b66]" />
          Unit Lock & Holding Deposit Details
        </h3>
        {selectedUnitDetails && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-[11px] font-bold text-success border border-success/20">
            <Building className="size-3" />
            Unit {selectedUnitDetails.unitNumber} ({selectedUnitDetails.type}) · {formatCurrency(selectedUnitDetails.price)}
          </span>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <Receipt className="size-3.5 text-slate-400" />
            Reservation Code (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. BF-RES-2026-015 (Auto-generated)"
            value={form.reservationNumber}
            onChange={(e) =>
              setForm({ ...form, reservationNumber: e.target.value })
            }
            className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-[#233b66] focus:outline-none focus:ring-1 focus:ring-[#233b66] shadow-2xs"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <User className="size-3.5 text-slate-400" />
            Select Buyer / Customer *
          </label>
          <select
            required
            value={form.customerId}
            onChange={(e) =>
              setForm({ ...form, customerId: e.target.value })
            }
            className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-[#233b66] focus:outline-none focus:ring-1 focus:ring-[#233b66] shadow-2xs"
          >
            <option value="">Select customer…</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.firstName} {c.lastName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <Building className="size-3.5 text-slate-400" />
            Select Available Unit *
          </label>
          <select
            required
            value={form.unitId}
            onChange={(e) => {
              const unit = availableUnits.find(
                (u) => u.id === e.target.value,
              );
              const suggestedDeposit =
                unit && unit.price
                  ? Math.round(Number(unit.price) * 0.05)
                  : "";
              setForm({
                ...form,
                unitId: e.target.value,
                amount: suggestedDeposit
                  ? String(suggestedDeposit)
                  : form.amount,
              });
            }}
            className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-[#233b66] focus:outline-none focus:ring-1 focus:ring-[#233b66] shadow-2xs"
          >
            <option value="">Select available unit…</option>
            {availableUnits.map((u) => (
              <option key={u.id} value={u.id}>
                Unit {u.unitNumber} · {u.type} ·{" "}
                {formatCurrency(u.price)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <Coins className="size-3.5 text-slate-400" />
            Reservation Deposit Amount (ETB) *
          </label>
          <input
            required
            type="number"
            min="0"
            placeholder="e.g. 250000"
            value={form.amount}
            onChange={(e) =>
              setForm({ ...form, amount: e.target.value })
            }
            className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-[#233b66] focus:outline-none focus:ring-1 focus:ring-[#233b66] shadow-2xs font-semibold"
          />
          {selectedUnitDetails && form.amount && (
            <p className="mt-1 text-[11px] text-[#233b66] font-medium">
              {(
                (Number(form.amount) /
                  Number(selectedUnitDetails.price)) *
                100
              ).toFixed(1)}
              % of total unit price
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <CalendarDays className="size-3.5 text-slate-400" />
            Hold Expiration Window
          </label>
          <select
            value={form.holdPeriodDays}
            onChange={(e) =>
              setForm({ ...form, holdPeriodDays: e.target.value })
            }
            className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-[#233b66] focus:outline-none focus:ring-1 focus:ring-[#233b66] shadow-2xs"
          >
            <option value="7">7 Days Standard Hold</option>
            <option value="14">
              14 Days Extended Hold (Recommended)
            </option>
            <option value="30">30 Days Diaspora Buyer Window</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <Banknote className="size-3.5 text-slate-400" />
            Deposit Payment Method
          </label>
          <select
            value={form.paymentMethod}
            onChange={(e) =>
              setForm({ ...form, paymentMethod: e.target.value })
            }
            className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-[#233b66] focus:outline-none focus:ring-1 focus:ring-[#233b66] shadow-2xs"
          >
            <option value="BANK_TRANSFER">
              CBE / Bank Transfer (የባንክ ሐዋላ)
            </option>
            <option value="TELEBIRR">Telebirr (ቴሌብር)</option>
            <option value="CBE_BIRR">CBE Birr (ሲቢኢ ብር)</option>
            <option value="CASH_DEPOSIT">
              Cash Deposit (በጥሬ ገንዘብ)
            </option>
            <option value="CHECK">Check (በቼክ)</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <Receipt className="size-3.5 text-slate-400" />
            Bank Receipt / Transaction Ref Number
          </label>
          <input
            type="text"
            placeholder="e.g. CBE Transaction Ref FT2620689431..."
            value={form.receiptNumber}
            onChange={(e) =>
              setForm({ ...form, receiptNumber: e.target.value })
            }
            className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-[#233b66] focus:outline-none focus:ring-1 focus:ring-[#233b66] shadow-2xs"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Special Notes / Hold Conditions
          </label>
          <input
            type="text"
            placeholder="e.g. Buyer pending diaspora mortgage pre-approval..."
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-[#233b66] focus:outline-none focus:ring-1 focus:ring-[#233b66] shadow-2xs"
          />
        </div>
      </div>

      <div className="mt-5 flex justify-end gap-2 border-t border-[#233b66]/10 pt-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg px-5 py-2 text-xs font-semibold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
        >
          {saving ? "Locking Inventory..." : "Lock Unit & Issue Hold"}
        </button>
      </div>
    </form>
  );
}
