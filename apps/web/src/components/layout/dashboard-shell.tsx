import Link from "next/link";
import Image from "next/image";
import type { ElementType, ReactNode } from "react";
import {
  BarChart3,
  Building,
  Building2,
  CalendarDays,
  ChevronDown,
  CircleDollarSign,
  ClipboardList,
  FileText,
  Grip,
  Home,
  Megaphone,
  Menu,
  MoreHorizontal,
  Phone,
  Plus,
  RotateCw,
  Route,
  Search,
  Settings,
  ShoppingBag,
  SquareStack,
  UserCircle,
  UserRoundCheck,
  UsersRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const primaryNavItems = [
  { label: "Home", href: "/dashboard", icon: Home, aliases: ["Dashboard"] },
  { label: "Reports", href: "/reports/sales", icon: BarChart3 },
];

const moduleNavItems = [
  { label: "Leads", href: "/leads", icon: UserRoundCheck },
  { label: "Contacts", href: "/customers", icon: UsersRound, aliases: ["Customers"] },
  { label: "Accounts", href: "/properties", icon: Building, aliases: ["Properties"] },
  { label: "Deals", href: "/deals", icon: CircleDollarSign },
  { label: "Tasks", href: "/tasks", icon: ClipboardList },
  { label: "Meetings", href: "/site-visits", icon: CalendarDays, aliases: ["Site visits"] },
  { label: "Calls", href: "/notifications/follow-ups", icon: Phone },
  { label: "Campaigns", href: "/automation/email-campaigns", icon: Megaphone },
  { label: "Documents", href: "/documents", icon: FileText },
  { label: "Visits", href: "/site-visits", icon: Route },
  { label: "Projects", href: "/projects", icon: Building2 },
  { label: "Units", href: "/units", icon: SquareStack },
  { label: "Reservations", href: "/reservations", icon: ShoppingBag },
];

const utilityNavItems = [
  { label: "Payments", href: "/payments", icon: CircleDollarSign },
  { label: "Settings", href: "/settings", icon: Settings },
];

type NavItem = {
  label: string;
  href: string;
  icon: ElementType;
  aliases?: string[];
};

type DashboardShellProps = {
  children: ReactNode;
  title: string;
  description: string;
  active?: string;
};

function isActiveItem(item: NavItem, active: string) {
  return item.label === active || item.aliases?.includes(active);
}

function SidebarLink({ item, active }: { item: NavItem; active: string }) {
  const Icon = item.icon;
  const isActive = isActiveItem(item, active);

  return (
    <Link
      href={item.href}
      className={cn(
        "flex h-[30px] items-center gap-3 rounded px-2.5 text-[14px] font-medium text-[#e8efff] transition hover:bg-white/10",
        isActive && "bg-white/10 text-white",
      )}
    >
      <Icon className={cn("size-4 text-[#91a1bd]", isActive && "text-[#70a0ff]")} />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

export function DashboardShell({
  children,
  title,
  description,
  active = "Dashboard",
}: DashboardShellProps) {
  const displayTitle = title === "Dashboard" ? "Home" : title;

  return (
    <div className="min-h-screen bg-[#e9edf5] text-[#071426]">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 bg-[#233b66] text-white lg:block">
        <div className="flex h-12 items-center justify-between px-3">
          <Link href="/dashboard" className="flex min-w-0 items-center gap-2">
            <Image
              src="/betflow-mark.svg"
              alt="BetFlow"
              width={30}
              height={30}
              className="rounded-md"
              priority
            />
            <span className="truncate text-[16px] font-semibold">BetFlow CRM</span>
          </Link>
          <Button variant="ghost" size="icon-sm" className="text-[#cbd7ef] hover:bg-white/10 hover:text-white">
            <Menu className="size-4" />
          </Button>
        </div>

        <nav className="space-y-1 px-2 pb-3">
          {primaryNavItems.map((item) => (
            <SidebarLink key={item.href} item={item} active={active} />
          ))}
        </nav>

        <div className="border-t border-white/14 px-2 pt-3">
          <div className="mb-2 flex items-center gap-2 px-1 text-[15px] font-semibold text-white">
            <div className="grid size-5 grid-cols-2 gap-0.5 rounded bg-[#ff4e96] p-0.5">
              <span className="rounded-sm bg-white/70" />
              <span className="rounded-sm bg-white/70" />
              <span className="rounded-sm bg-white/70" />
              <span className="rounded-sm bg-white/70" />
            </div>
            Modules
          </div>
          <label className="mb-3 flex h-8 items-center gap-2 rounded-md border border-white/18 px-2 text-[#b7c5dd]">
            <Search className="size-4" />
            <input
              aria-label="Search modules"
              className="w-full bg-transparent text-sm outline-none placeholder:text-[#b7c5dd]"
              placeholder="Search"
            />
          </label>
          <nav className="max-h-[calc(100vh-220px)] space-y-1 overflow-y-auto pr-1">
            {moduleNavItems.map((item) => (
              <SidebarLink key={`${item.href}-${item.label}`} item={item} active={active} />
            ))}
            <div className="my-2 border-t border-white/14" />
            {utilityNavItems.map((item) => (
              <SidebarLink key={item.href} item={item} active={active} />
            ))}
          </nav>
        </div>
      </aside>

      <div className="lg:pl-60">
        <header className="sticky top-0 z-10 border-b border-[#d4dceb] bg-white">
          <div className="flex h-12 items-center justify-between gap-4 px-4">
            <div className="flex min-w-0 items-center gap-3">
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-[#314466] hover:bg-[#edf2fb] lg:hidden"
                aria-label="Open navigation"
              >
                <Menu className="size-4" />
              </Button>
              <div className="min-w-0">
                <h1 className="truncate text-xl font-medium tracking-normal text-[#071426]">{displayTitle}</h1>
                {title !== "Dashboard" ? (
                  <p className="hidden truncate text-xs text-[#71809a] sm:block">{description}</p>
                ) : null}
              </div>
            </div>

            <div className="flex min-w-0 items-center justify-end gap-2">
              <label className="hidden h-8 w-[235px] items-center gap-2 rounded-md bg-[#edf1f8] px-3 text-[#6b7a94] xl:flex">
                <Search className="size-4" />
                <input
                  aria-label="Search records"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-[#6b7a94]"
                  placeholder="Search records"
                />
              </label>
              <Button variant="outline" size="icon" className="size-8 border-[#4569ff] text-[#4569ff]">
                <Plus className="size-4" />
              </Button>
              <Button variant="ghost" size="icon" className="hidden text-[#53627b] hover:bg-[#edf2fb] sm:inline-flex">
                <CalendarDays className="size-4" />
              </Button>
              <Button variant="ghost" size="icon" className="hidden text-[#53627b] hover:bg-[#edf2fb] sm:inline-flex">
                <ShoppingBag className="size-4" />
              </Button>
              <Button variant="ghost" size="icon" className="hidden text-[#53627b] hover:bg-[#edf2fb] md:inline-flex">
                <Settings className="size-4" />
              </Button>
              <div className="hidden size-8 items-center justify-center rounded-full bg-[#dce3ef] text-[#7a879b] sm:flex">
                <UserCircle className="size-7" />
              </div>
              <Grip className="hidden size-5 text-[#3c485c] sm:block" />
            </div>
          </div>
        </header>

        <div className="flex h-[56px] items-center justify-between gap-3 border-b border-[#d9e1ee] bg-[#eef2f8] px-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-md border border-[#d5deeb] bg-[#e3e9f2] text-[#9badc5]">
              <Building2 className="size-7" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[18px] font-semibold">Welcome Birhanu Baynesagn</p>
            </div>
          </div>
          <div className="hidden items-center gap-3 lg:flex">
            <Button variant="ghost" size="icon" className="text-[#25354d] hover:bg-white">
              <RotateCw className="size-4" />
            </Button>
            <button className="flex h-9 items-center gap-3 rounded-md border border-[#c2cad8] bg-white px-4 text-sm text-[#071426]">
              Birhanu Baynesagn&apos;s Home
              <ChevronDown className="size-4 text-[#67758d]" />
            </button>
            <Button variant="outline" size="icon" className="size-9 border-[#cbd4e2] bg-[#f7f9fd]">
              <MoreHorizontal className="size-5" />
            </Button>
          </div>
        </div>

        <main className="px-3 py-3 sm:px-4">{children}</main>
      </div>
    </div>
  );
}
