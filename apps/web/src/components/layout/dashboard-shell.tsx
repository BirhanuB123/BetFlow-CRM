import Link from "next/link";
import {
  Bell,
  Bot,
  BookOpen,
  Building2,
  Building,
  Cable,
  CircleDollarSign,
  ClipboardCheck,
  ClipboardList,
  CreditCard,
  FileArchive,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  GalleryHorizontalEnd,
  GraduationCap,
  Home,
  KeyRound,
  Laptop,
  ListTodo,
  MailCheck,
  MessageSquareText,
  MessagesSquare,
  Send,
  ReceiptText,
  BarChart3,
  BrainCircuit,
  LineChart,
  PieChart,
  Download,
  Globe,
  Hammer,
  HelpCircle,
  Palette,
  PackageCheck,
  PanelTop,
  Presentation,
  Route,
  Settings,
  ShieldCheck,
  Smartphone,
  SquareStack,
  Stamp,
  ToggleLeft,
  UserRoundCheck,
  UsersRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "Leads", href: "/leads", icon: UserRoundCheck },
  { label: "Customers", href: "/customers", icon: UsersRound },
  { label: "Deals", href: "/deals", icon: CircleDollarSign },
  { label: "Projects", href: "/projects", icon: Building2 },
  { label: "Properties", href: "/properties", icon: Building },
  { label: "Units", href: "/units", icon: SquareStack },
  { label: "Media", href: "/properties/media", icon: GalleryHorizontalEnd },
  { label: "Site visits", href: "/site-visits", icon: Route },
  { label: "Reservations", href: "/reservations", icon: ReceiptText },
  { label: "Payments", href: "/payments", icon: CreditCard },
  { label: "Finance", href: "/payments/approvals", icon: Stamp },
  { label: "Documents", href: "/documents", icon: FileText },
  { label: "Templates", href: "/contracts/templates", icon: FileCheck2 },
  { label: "Contracts", href: "/contracts/signed", icon: FileArchive },
  { label: "Notifications", href: "/notifications", icon: Send },
  { label: "Website leads", href: "/integrations/website-leads", icon: PanelTop },
  { label: "Social leads", href: "/integrations/social-leads", icon: MessagesSquare },
  { label: "Follow-up automation", href: "/automation/follow-up", icon: Bot },
  { label: "Email campaigns", href: "/automation/email-campaigns", icon: MailCheck },
  { label: "Customer portal", href: "/portal", icon: Laptop },
  { label: "Mobile PWA", href: "/mobile", icon: Smartphone },
  { label: "Forecasting", href: "/forecasting", icon: BrainCircuit },
  { label: "Builder", href: "/contracts/builder", icon: Hammer },
  { label: "Approvals", href: "/approvals", icon: ShieldCheck },
  { label: "Marketplace", href: "/marketplace", icon: Cable },
  { label: "Sales report", href: "/reports/sales", icon: BarChart3 },
  { label: "Agents", href: "/reports/agents", icon: UsersRound },
  { label: "Revenue", href: "/reports/revenue", icon: LineChart },
  { label: "Inventory rpt", href: "/reports/inventory", icon: PieChart },
  { label: "Plans", href: "/settings/subscription", icon: PackageCheck },
  { label: "Billing", href: "/billing", icon: CreditCard },
  { label: "Feature flags", href: "/settings/feature-flags", icon: ToggleLeft },
  { label: "Branding", href: "/settings/branding", icon: Palette },
  { label: "Domains", href: "/settings/domains", icon: Globe },
  { label: "Onboarding", href: "/settings/onboarding", icon: ClipboardCheck },
  { label: "Excel import", href: "/settings/import", icon: FileSpreadsheet },
  { label: "Data jobs", href: "/settings/data", icon: Download },
  { label: "User guide", href: "/guides/user", icon: BookOpen },
  { label: "Admin guide", href: "/guides/admin", icon: ShieldCheck },
  { label: "Training", href: "/training/videos", icon: GraduationCap },
  { label: "Sales deck", href: "/sales/deck", icon: Presentation },
  { label: "Proposal", href: "/sales/proposal", icon: FileText },
  { label: "Support", href: "/support", icon: HelpCircle },
  { label: "Tasks", href: "/tasks", icon: ListTodo },
  { label: "Notes", href: "/notes", icon: MessageSquareText },
  { label: "Activity", href: "/reports/activity", icon: ClipboardList },
  { label: "Auth", href: "/auth", icon: KeyRound },
  { label: "Users", href: "/settings#users", icon: UsersRound },
  { label: "RBAC", href: "/settings#rbac", icon: ShieldCheck },
  { label: "Tenant", href: "/settings#tenant", icon: Building2 },
  { label: "Audit logs", href: "/settings/audit-logs", icon: ClipboardList },
];

type DashboardShellProps = {
  children: React.ReactNode;
  title: string;
  description: string;
  active?: string;
};

export function DashboardShell({
  children,
  title,
  description,
  active = "Dashboard",
}: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-[#f6f7f9] text-zinc-950">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-zinc-200 bg-white lg:block">
        <div className="flex h-16 items-center gap-3 border-b border-zinc-200 px-5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-zinc-950 text-sm font-semibold text-white">
            BF
          </div>
          <div>
            <p className="text-sm font-semibold">BetFlow CRM</p>
            <p className="text-xs text-zinc-500">CRM workspace</p>
          </div>
        </div>
        <nav className="h-[calc(100vh-4rem)] space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.label;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950",
                  isActive && "bg-zinc-950 text-white hover:bg-zinc-950 hover:text-white",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/95 backdrop-blur">
          <div className="flex min-h-16 items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <div>
              <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
              <p className="text-sm text-zinc-500">{description}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" aria-label="Notifications">
                <Bell className="size-4" />
              </Button>
              <Button variant="outline" size="icon" aria-label="Settings">
                <Settings className="size-4" />
              </Button>
              <div className="hidden h-9 items-center gap-2 rounded-lg border border-zinc-200 px-2.5 text-sm font-medium sm:flex">
                <span className="size-2 rounded-full bg-emerald-500" />
                Maya
              </div>
            </div>
          </div>
        </header>
        <main className="px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
