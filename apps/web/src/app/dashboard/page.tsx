import { Building, CalendarDays, ChevronLeft, ChevronRight, ClipboardList, WalletCards } from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ActivityTimeline } from "@/components/activity/activity-timeline";

const openTasks = [
  ["Register for upcoming CRM Webinars", "Jun 29, 2026", "Not Started", "Low", "King (Sample)", "Kristin Smith (Sample)"],
  ["Refer CRM Videos", "Jul 1, 2026", "In Progress", "Normal", "Morlong Associates", "Mitchel Tollner (Sample)"],
  ["Competitor Comparison Document", "Jun 27, 2026", "Not Started", "Highest", "Feltz Printing Service", "Capla Paprocki (Sample)"],
  ["Get Approval from Manager", "Jun 28, 2026", "Not Started", "Low", "Chapman", "Sira Morres (Sample)"],
  ["Invite prospects for product demo", "Jun 30, 2026", "Deferred", "Normal", "Commercial Press", "Leota Dilliard (Sample)"],
];

const meetings = [
  ["Demo", "Jun 29, 2026 01:26 PM", "Jun 29, 2026 02:26 PM", "Printing Dimensions", "Donette Foller (Sample)"],
  ["Webinar", "Jun 29, 2026 03:26 PM", "Jun 29, 2026 04:26 PM", "Commercial Press (Sample)", "Leota Dilliard (Sample)"],
  ["TradeShow", "Jun 28, 2026 08:00 PM", "Jun 29, 2026 07:59 PM", "Chemel", "James Venere (Sample)"],
  ["Webinar", "Jun 29, 2026 02:26 PM", "Jun 29, 2026 05:26 PM", "Chanay (Sample)", "Josephine Darakjy (Sample)"],
  ["Seminar", "Jun 29, 2026 01:26 PM", "Jun 29, 2026 03:26 PM", "Carissa Kidman (Sample)", ""],
  ["Attend Customer conference", "Jun 28, 2026 08:00 PM", "Jun 29, 2026 07:59 PM", "Feltz Printing Service", "Capla Paprocki (Sample)"],
];

const closingDeals = [
  ["King", "$ 60,000.00", "Id. Decision Makers", "Jul 2, 2026", "King (Sample)", "Kristin Smith (Sample)"],
  ["Commercial Press", "$ 45,000.00", "Closed Lost", "Jul 1, 2026", "Commercial Press (Sample)", "Leota Dilliard (Sample)"],
  ["Morlong Associates", "$ 35,000.00", "Closed Won", "Jul 2, 2026", "Morlong Associates (Sample)", "Mitchel Tollner (Sample)"],
  ["Printing Dimensions", "$ 25,000.00", "Proposal/Price Quote", "Jul 5, 2026", "Printing Dimensions", "Donette Foller (Sample)"],
  ["Feltz Printing Service", "$ 18,500.00", "Negotiation", "Jul 8, 2026", "Feltz Printing Service", "Capla Paprocki (Sample)"],
];

const avatarColors = ["bg-[#d9b18f]", "bg-[#9ec4d8]", "bg-[#7ea46d]", "bg-[#c89a72]", "bg-[#b4c99a]"];

function initials(name: string) {
  return name
    .replace("(Sample)", "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function ContactCell({ name, index }: { name: string; index: number }) {
  if (!name) {
    return <span className="text-[#7d8aa0]">-</span>;
  }

  return (
    <span className="flex min-w-[155px] items-center gap-2">
      <span
        className={`flex size-5 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold text-white ${
          avatarColors[index % avatarColors.length]
        }`}
      >
        {initials(name)}
      </span>
      <a href="#" className="leading-4 text-[#334cff] hover:underline">
        {name}
      </a>
    </span>
  );
}

function RelatedCell({ value }: { value: string }) {
  return (
    <span className="flex min-w-[150px] items-start gap-1.5">
      <Building className="mt-0.5 size-4 shrink-0 text-[#404a5c]" />
      <a href="#" className="leading-4 text-[#334cff] hover:underline">
        {value}
      </a>
    </span>
  );
}

function CrmTableCard({
  title,
  icon,
  columns,
  rows,
  range,
}: {
  title: string;
  icon: "tasks" | "meetings" | "deals";
  columns: string[];
  rows: string[][];
  range: string;
}) {
  const HeaderIcon = icon === "tasks" ? ClipboardList : icon === "meetings" ? CalendarDays : WalletCards;

  return (
    <section className="min-w-0 rounded-lg bg-white shadow-[0_1px_0_rgba(17,31,57,0.06)]">
      <div className="flex h-16 items-center gap-2 border-b border-[#edf0f5] px-5">
        <HeaderIcon className="size-4 text-[#32445f]" />
        <h2 className="text-base font-semibold">{title}</h2>
      </div>
      <div className="mx-5 overflow-hidden">
        <div className="max-h-[336px] overflow-auto pb-1">
          <table className="min-w-[780px] table-fixed border-collapse text-left text-sm">
            <thead className="sticky top-0 z-[1] bg-white">
              <tr className="border-b border-[#e5e9f1]">
                {columns.map((column) => (
                  <th key={column} className="h-8 border-r border-[#dce3ef] px-3 font-normal text-[#071426] last:border-r-0">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={`${title}-${row[0]}`} className="border-b border-[#edf0f5] align-top">
                  {row.map((cell, cellIndex) => {
                    const isFirst = cellIndex === 0;
                    const isRelated = columns[cellIndex] === "Related To" || columns[cellIndex] === "Account Name";
                    const isContact = columns[cellIndex] === "Contact Name";

                    return (
                      <td key={`${row[0]}-${columns[cellIndex]}`} className="px-3 py-3 leading-4 text-[#071426]">
                        {isFirst ? (
                          <a href="#" className="text-[#334cff] hover:underline">
                            {cell}
                          </a>
                        ) : isContact ? (
                          <ContactCell name={cell} index={rowIndex} />
                        ) : isRelated ? (
                          <RelatedCell value={cell} />
                        ) : (
                          cell
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex h-12 items-center justify-end gap-5 border-t border-[#edf0f5] text-sm font-semibold">
          <span>{range}</span>
          <button className="text-[#63718a]" aria-label={`Previous ${title}`}>
            <ChevronLeft className="size-5" />
          </button>
          <button className="text-[#63718a]" aria-label={`Next ${title}`}>
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>
    </section>
  );
}

function TodaysLeadsCard() {
  return (
    <section className="min-h-[330px] rounded-lg bg-white shadow-[0_1px_0_rgba(17,31,57,0.06)]">
      <div className="flex h-16 items-center border-b border-[#edf0f5] px-5">
        <h2 className="text-base font-semibold">Today&apos;s Leads</h2>
      </div>
      <div className="flex min-h-[260px] items-center justify-center">
        <div className="relative size-[142px] rounded-xl border-2 border-dashed border-[#dce5f1] bg-[#f8fbff]">
          <div className="absolute left-5 top-7 h-[88px] w-[106px] rounded-lg border-2 border-[#cfdae9] bg-white shadow-sm">
            <div className="h-7 border-b border-[#e5ebf4]" />
            <div className="grid grid-cols-3 gap-2 p-3">
              <span className="h-2 rounded bg-[#e5ebf4]" />
              <span className="h-2 rounded bg-[#e5ebf4]" />
              <span className="h-2 rounded bg-[#e5ebf4]" />
              <span className="h-3 rounded bg-[#eef3fa]" />
              <span className="h-3 rounded bg-[#eef3fa]" />
              <span className="h-3 rounded bg-[#eef3fa]" />
              <span className="h-3 rounded bg-[#eef3fa]" />
              <span className="h-3 rounded bg-[#eef3fa]" />
              <span className="h-3 rounded bg-[#eef3fa]" />
            </div>
          </div>
          <div className="absolute left-9 top-8 h-1.5 w-10 rounded-full border border-[#c4d1e2]" />
        </div>
      </div>
    </section>
  );
}

export default function DashboardPage() {
  return (
    <DashboardShell
      title="Dashboard"
      description="CRM home overview for daily tasks, meetings, leads, and closing deals."
      active="Dashboard"
    >
      <div className="grid gap-3 xl:grid-cols-2">
        <CrmTableCard
          title="My Open Tasks"
          icon="tasks"
          columns={["Subject", "Due Date", "Status", "Priority", "Related To", "Contact Name"]}
          rows={openTasks}
          range="1 - 10"
        />
        <CrmTableCard
          title="My Meetings"
          icon="meetings"
          columns={["Title", "From", "To", "Related To", "Contact Name"]}
          rows={meetings}
          range="1 - 9"
        />
        <TodaysLeadsCard />
        <CrmTableCard
          title="My Deals Closing This Month"
          icon="deals"
          columns={["Deal Name", "Amount", "Stage", "Closing Date", "Account Name", "Contact Name"]}
          rows={closingDeals}
          range="1 - 8"
        />
      </div>

      <div className="mt-3">
        <ActivityTimeline title="Recent activity" limit={25} />
      </div>
    </DashboardShell>
  );
}
