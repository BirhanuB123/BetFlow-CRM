import { Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ContactOption = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  leadStage?: string;
};

export type SmsComposerState = {
  selectedContactId: string;
  recipientName: string;
  recipientPhone: string;
  templateKey: string;
  body: string;
};

interface SmsCampaignModalProps {
  composerForm: SmsComposerState;
  setComposerForm: (val: SmsComposerState | ((prev: SmsComposerState) => SmsComposerState)) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  contacts: ContactOption[];
  handleTemplateSelect: (key: string) => void;
  insertVariableTag: (
    tag: string,
    setter: (val: string | ((prev: string) => string)) => void,
  ) => void;
  sendingSms: boolean;
  charCount: number;
  segmentCount: number;
}

export function SmsCampaignModal({
  composerForm,
  setComposerForm,
  onSubmit,
  onClose,
  contacts,
  handleTemplateSelect,
  insertVariableTag,
  sendingSms,
  charCount,
  segmentCount,
}: SmsCampaignModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-slate-200 relative">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Send className="size-4 text-[#233b66]" />
            Compose Custom Broadcast SMS
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 text-xs">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Select Contact from CRM
              </label>
              <select
                value={composerForm.selectedContactId}
                onChange={(e) => {
                  const c = contacts.find((item) => item.id === e.target.value);
                  if (c) {
                    setComposerForm((prev) => ({
                      ...prev,
                      selectedContactId: c.id,
                      recipientName: `${c.firstName} ${c.lastName}`.trim(),
                      recipientPhone: c.phone,
                    }));
                  } else {
                    setComposerForm((prev) => ({
                      ...prev,
                      selectedContactId: "",
                    }));
                  }
                }}
                className="h-9 w-full rounded-lg border border-slate-300 px-3 text-xs outline-none focus:border-[#233b66] focus:ring-1 focus:ring-[#233b66] bg-white"
              >
                <option value="">Custom phone entry…</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.firstName} {c.lastName} ({c.phone})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Recipient Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Abebe Bikila"
                value={composerForm.recipientName}
                onChange={(e) =>
                  setComposerForm((prev) => ({
                    ...prev,
                    recipientName: e.target.value,
                  }))
                }
                className="h-9 w-full rounded-lg border border-slate-300 px-3 text-xs outline-none focus:border-[#233b66] focus:ring-1 focus:ring-[#233b66]"
                required
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Recipient Mobile Number *
              </label>
              <input
                type="text"
                placeholder="0911234567 or +251911..."
                value={composerForm.recipientPhone}
                onChange={(e) =>
                  setComposerForm((prev) => ({
                    ...prev,
                    recipientPhone: e.target.value,
                  }))
                }
                className="h-9 w-full rounded-lg border border-slate-300 px-3 text-xs outline-none focus:border-[#233b66] focus:ring-1 focus:ring-[#233b66] font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Template Preset
            </label>
            <select
              value={composerForm.templateKey}
              onChange={(e) => handleTemplateSelect(e.target.value)}
              className="h-9 w-full rounded-lg border border-slate-300 px-3 text-xs outline-none focus:border-[#233b66] focus:ring-1 focus:ring-[#233b66] bg-white"
            >
              <option value="CUSTOM">Custom Message Text</option>
              <option value="SITE_VISIT_REMINDER">
                Site Visit Reminder Preset
              </option>
              <option value="HOLD_EXPIRY_ALERT">
                14-Day Hold Expiry Alert Preset
              </option>
              <option value="PAYMENT_DUE_ALERT">
                Installment Due Alert Preset
              </option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700">
                SMS Body Text
              </label>
              <span className="text-[11px] font-semibold text-slate-500">
                {charCount} chars ·{" "}
                <strong className="text-[#233b66]">
                  {segmentCount} segment(s)
                </strong>
              </span>
            </div>

            {/* Variable Insertion Chips */}
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              <span className="text-[10px] text-slate-400 font-semibold">
                Insert Tag:
              </span>
              {[
                "{clientName}",
                "{projectName}",
                "{unitNumber}",
                "{agentPhone}",
              ].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() =>
                    insertVariableTag(tag, (val) =>
                      setComposerForm((prev) => ({
                        ...prev,
                        body: typeof val === "function" ? val(prev.body) : val,
                      })),
                    )
                  }
                  className="rounded bg-sky-50 px-2 py-0.5 text-[10px] font-mono font-semibold text-sky-700 border border-sky-200 hover:bg-sky-100 transition-colors cursor-pointer"
                >
                  + {tag}
                </button>
              ))}
            </div>

            <textarea
              rows={4}
              placeholder="Type your SMS alert message..."
              value={composerForm.body}
              onChange={(e) =>
                setComposerForm((prev) => ({
                  ...prev,
                  body: e.target.value,
                }))
              }
              className="w-full rounded-lg border border-slate-300 p-3 text-xs outline-none focus:border-[#233b66] focus:ring-1 focus:ring-[#233b66] font-mono leading-relaxed"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-9 px-4 text-xs font-semibold text-slate-700"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={sendingSms}
              className="h-9 px-5 font-bold text-xs"
            >
              {sendingSms ? "Dispatching..." : "Send via Shortcode 8844"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
