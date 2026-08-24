"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ElementType,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
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
  LogOut,
  Megaphone,
  Menu,
  MessageSquare,
  MoreHorizontal,
  Phone,
  Plus,
  RotateCw,
  Route,
  ScrollText,
  Search,
  Settings,
  ShoppingBag,
  SquareStack,
  UserCircle,
  UserRound,
  UserRoundCheck,
  UsersRound,
} from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/language-context";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useBranding } from "@/lib/branding-context";
import { usePermissions } from "@/hooks/use-permissions";

const SIDEBAR_MIN = 200;
const SIDEBAR_MAX = 460;

type StoredSession = {
  accessToken: string;
  tenant?: unknown;
  user?: unknown;
};

function useStoredSession(): StoredSession | null {
  const raw = useSyncExternalStore(
    (onChange) => {
      window.addEventListener("storage", onChange);
      return () => window.removeEventListener("storage", onChange);
    },
    () =>
      typeof window === "undefined"
        ? null
        : (window.localStorage.getItem("betflow-auth") ??
          window.sessionStorage.getItem("betflow-auth")),
    () => null,
  );

  return useMemo(() => {
    if (!raw) return null;
    try {
      return JSON.parse(raw) as StoredSession;
    } catch {
      return null;
    }
  }, [raw]);
}

const primaryNavItems = [
  { label: "Home", href: "/dashboard", icon: Home, aliases: ["Dashboard"] },
  {
    label: "Reports",
    href: "/reports",
    icon: BarChart3,
    aliases: ["Sales report"],
  },
];

const navSections = [
  {
    title: "Sales & Pipeline",
    items: [
      {
        label: "Pipeline",
        href: "/pipeline",
        icon: UserRoundCheck,
        aliases: ["Leads", "Customers", "Deals", "Sales", "Contacts", "Buyers"],
      },
    ],
  },
  {
    title: "Activities & Engagement",
    items: [
      {
        label: "Activities",
        href: "/activities",
        icon: ClipboardList,
        aliases: [
          "Tasks",
          "Meetings",
          "Calls",
          "Visits",
          "Site visits",
          "Activity log",
          "Call logs",
          "Telephony",
        ],
      },
    ],
  },
  {
    title: "Property Inventory",
    items: [
      {
        label: "Projects",
        href: "/projects",
        icon: Building2,
        aliases: ["Units", "Stacking Matrix", "Inventory", "Property units"],
      },
    ],
  },
  {
    title: "Transactions & Finance",
    items: [
      {
        label: "Transactions",
        href: "/transactions",
        icon: CircleDollarSign,
        aliases: [
          "Reservations",
          "Contracts",
          "Payments",
          "Payment Schedules",
          "Milestones",
          "Holds",
        ],
      },
    ],
  },
  {
    title: "Marketing & Automation",
    items: [
      {
        label: "Campaigns",
        href: "/campaigns",
        icon: Megaphone,
        aliases: [
          "Social Outreach",
          "SMS & Drip Automation",
          "SMS",
          "Telegram",
          "Meta",
          "Outreach",
        ],
      },
    ],
  },
  {
    title: "System & Assets",
    items: [
      { label: "Documents", href: "/documents", icon: FileText },
    ],
  },
];

const moduleNavItems = navSections.flatMap((s) => s.items);

const createItems = [
  { label: "New Lead", href: "/pipeline?tab=leads", icon: UserRoundCheck },
  { label: "New Customer", href: "/pipeline?tab=customers", icon: UsersRound },
  { label: "New Deal", href: "/pipeline?tab=deals", icon: CircleDollarSign },
  { label: "New Task", href: "/tasks", icon: ClipboardList },
  { label: "New Meeting", href: "/meetings", icon: CalendarDays },
];

const searchIndex = [...primaryNavItems, ...moduleNavItems];

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

const navKeyMap: Record<string, string> = {
  "Home": "dashboard.home",
  "Dashboard": "nav.dashboard",
  "Reports": "nav.reports",
  "Pipeline": "nav.pipeline",
  "Activities": "nav.activities",
  "Transactions": "nav.transactions",
  "Campaigns": "nav.campaigns",
  "Leads": "nav.leads",
  "Customers": "nav.customers",
  "Deals": "nav.deals",
  "Tasks": "nav.tasks",
  "Meetings": "nav.meetings",
  "Calls": "nav.calls",
  "Visits": "nav.siteVisits",
  "Projects": "nav.projects",
  "Units": "nav.units",
  "Reservations": "nav.reservations",
  "Contracts": "nav.contracts",
  "Payment Schedules": "nav.paymentSchedules",
  "Social Outreach": "nav.campaigns",
  "SMS & Drip Automation": "nav.sms",
  "Documents": "nav.documents",
  "Settings": "nav.settings",
};

const sectionTitleMap: Record<string, string> = {
  "Sales & Pipeline": "የሽያጭና የሂደት መስመር",
  "Activities & Engagement": "እንቅስቃሴዎች እና ቀጠሮዎች",
  "Property Inventory": "የህንፃ ክፍሎች ዝርዝር",
  "Transactions & Finance": "ክፍያዎች እና ፋይናንስ",
  "Marketing & Automation": "ማርኬቲንግ እና አውቶሜሽን",
  "System & Assets": "ሲስተም እና ሰነዶች",
};

const itemBadges: Record<string, { label: string; cls: string }> = {
  Pipeline: {
    label: "12",
    cls: "bg-emerald-500/25 text-emerald-300 border-emerald-400/40",
  },
  Leads: {
    label: "12",
    cls: "bg-emerald-500/25 text-emerald-300 border-emerald-400/40",
  },
  Tasks: {
    label: "5",
    cls: "bg-amber-500/25 text-amber-300 border-amber-400/40",
  },
  Deals: {
    label: "New",
    cls: "bg-blue-500/25 text-blue-300 border-blue-400/40",
  },
  "Social Outreach": {
    label: "Live",
    cls: "bg-purple-500/25 text-purple-300 border-purple-400/40",
  },
};

function SidebarLink({
  item,
  active,
  onNavigate,
}: {
  item: NavItem;
  active: string;
  onNavigate?: () => void;
}) {
  const { t } = useTranslation();
  const Icon = item.icon;
  const isActive = isActiveItem(item, active);
  const displayLabel = navKeyMap[item.label] ? t(navKeyMap[item.label]) : item.label;
  const badge = itemBadges[item.label];

  return (
    <div className="relative group/link">
      <Link
        href={item.href}
        onClick={onNavigate}
        title={displayLabel}
        className={cn(
          "relative flex h-[42px] items-center gap-3.5 rounded-xl px-3 text-[16px] font-bold text-slate-100 transition-all duration-150",
          "hover:bg-white/15 hover:text-white hover:scale-[1.01]",
          "group-data-[collapsed=true]/side:lg:justify-center group-data-[collapsed=true]/side:lg:px-0",
          isActive && "bg-white/20 text-white font-extrabold shadow-sm",
        )}
      >
        {isActive ? (
          <span className="absolute left-0 top-2 bottom-2 w-1.5 rounded-r-full bg-[#70a0ff] shadow-[0_0_12px_#70a0ff] group-data-[collapsed=true]/side:lg:left-0" />
        ) : null}
        <Icon
          className={cn(
            "size-5 shrink-0 text-[#a4bbde] transition-transform duration-150 group-hover/link:scale-110",
            isActive && "text-[#70a0ff] scale-105",
          )}
        />
        <span className="truncate flex-1 group-data-[collapsed=true]/side:lg:hidden tracking-wide text-[16px]">
          {displayLabel}
        </span>
        {badge ? (
          <span
            className={cn(
              "hidden sm:inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-extrabold border leading-tight group-data-[collapsed=true]/side:lg:hidden",
              badge.cls,
            )}
          >
            {badge.label}
          </span>
        ) : null}
      </Link>

      {/* Floating Tooltip popover for collapsed rail view */}
      <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2.5 z-50 hidden rounded-md bg-[#162744] px-3 py-1.5 text-xs font-semibold text-white shadow-xl border border-white/20 whitespace-nowrap opacity-0 group-hover/link:opacity-100 group-hover/link:flex items-center gap-2 group-data-[collapsed=true]/side:lg:group-hover/link:flex transition-opacity duration-150">
        <span>{displayLabel}</span>
        {badge ? (
          <span className={cn("rounded-full px-1.5 py-0.2 text-[9.5px] font-bold border", badge.cls)}>
            {badge.label}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function SidebarSection({
  section,
  active,
  onNavigate,
}: {
  section: { title: string; items: NavItem[] };
  active: string;
  onNavigate?: () => void;
}) {
  const { t } = useTranslation();
  const hasActiveChild = useMemo(
    () => section.items.some((item) => isActiveItem(item, active)),
    [section.items, active],
  );

  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (hasActiveChild) {
      setOpen(true);
    }
  }, [hasActiveChild]);

  const sectionTitle =
    sectionTitleMap[section.title] && t("actions.signOut") !== "Sign Out"
      ? sectionTitleMap[section.title]
      : section.title;

  return (
    <div className="space-y-0.5">
      <div className="group/sec flex items-center justify-between px-2.5 pt-3 pb-1.5 text-[13px] sm:text-[13.5px] font-bold uppercase tracking-wider text-[#b4c8e8] group-data-[collapsed=true]/side:lg:hidden">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-1 text-left hover:text-white transition-colors cursor-pointer"
        >
          <span className="truncate">{sectionTitle}</span>
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-[#b4c8e8] transition-transform duration-200 group-hover/sec:text-white",
              !open && "-rotate-90",
            )}
          />
        </button>
      </div>

      <div
        className={cn(
          "grid transition-all duration-200 ease-in-out",
          open
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0 group-data-[collapsed=true]/side:lg:grid-rows-[1fr] group-data-[collapsed=true]/side:lg:opacity-100",
        )}
      >
        <div className="overflow-hidden space-y-0.5">
          {section.items.map((item) => (
            <SidebarLink
              key={`${item.href}-${item.label}`}
              item={item}
              active={active}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Lets menu items close the dropdown without putting a click handler on a
// role-less container (keeps axe happy: no orphaned menu/menuitem roles).
const DropdownCloseContext = createContext<() => void>(() => {});

function Dropdown({
  trigger,
  children,
  align = "end",
  panelClassName,
}: {
  trigger: ReactNode;
  children: ReactNode;
  align?: "start" | "end";
  panelClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Attach the toggle + ARIA to the real trigger button instead of wrapping it
  // in a role="button" div (which nested one interactive control inside another).
  const triggerNode = isValidElement<Record<string, unknown>>(trigger)
    ? cloneElement(trigger, {
        onClick: (event: ReactMouseEvent) => {
          (
            trigger.props.onClick as ((e: ReactMouseEvent) => void) | undefined
          )?.(event);
          setOpen((value) => !value);
        },
        "aria-haspopup": "menu",
        "aria-expanded": open,
      })
    : trigger;

  return (
    <div ref={ref} className="relative">
      {triggerNode}
      {open ? (
        <DropdownCloseContext.Provider value={() => setOpen(false)}>
          <div
            className={cn(
              "absolute top-full z-40 mt-2 min-w-[220px] rounded-lg border border-[#dbe2ee] bg-white p-1.5 shadow-[0_14px_34px_rgba(15,32,60,0.16)]",
              align === "end" ? "right-0" : "left-0",
              panelClassName,
            )}
          >
            {children}
          </div>
        </DropdownCloseContext.Provider>
      ) : null}
    </div>
  );
}

function MenuLink({
  href,
  icon: Icon,
  children,
}: {
  href: string;
  icon: ElementType;
  children: ReactNode;
}) {
  const close = useContext(DropdownCloseContext);
  return (
    <Link
      href={href}
      onClick={close}
      className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-[#243350] hover:bg-[#eef2fb]"
    >
      <Icon className="size-4 text-[#6a789a]" />
      {children}
    </Link>
  );
}

function MenuButton({
  icon: Icon,
  onClick,
  children,
  danger,
}: {
  icon: ElementType;
  onClick: () => void;
  children: ReactNode;
  danger?: boolean;
}) {
  const close = useContext(DropdownCloseContext);
  return (
    <button
      type="button"
      onClick={() => {
        onClick();
        close();
      }}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm hover:bg-[#eef2fb]",
        danger ? "text-[#c02a4a] hover:bg-[#fdeef1]" : "text-[#243350]",
      )}
    >
      <Icon
        className={cn("size-4", danger ? "text-[#c02a4a]" : "text-[#6a789a]")}
      />
      {children}
    </button>
  );
}

function ModuleGridLink({ item }: { item: NavItem }) {
  const close = useContext(DropdownCloseContext);
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={close}
      className="flex flex-col items-center gap-1 rounded-md px-1 py-2 text-center text-[11px] text-[#3d4a63] hover:bg-[#eef2fb]"
    >
      <Icon className="size-4 text-[#5a6a88]" />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

function SearchRecords() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return [];
    return searchIndex
      .filter((item) => item.label.toLowerCase().includes(term))
      .slice(0, 6);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const go = (href: string) => {
    setQuery("");
    setOpen(false);
    router.push(href);
  };

  return (
    <div ref={ref} className="relative hidden xl:block">
      <label className="flex h-9 w-[250px] items-center gap-2 rounded-full border border-slate-200 bg-slate-100/90 px-3.5 text-slate-500 focus-within:bg-white focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all shadow-2xs">
        <Search className="size-3.5 text-slate-400 shrink-0" />
        <input
          aria-label="Search records"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && results[0]) go(results[0].href);
          }}
          className="w-full bg-transparent text-xs text-slate-800 outline-none placeholder:text-slate-400 font-medium"
          placeholder="Search records or modules..."
        />
        <kbd className="hidden sm:inline-flex select-none items-center rounded border border-slate-200 bg-slate-50 px-1.5 font-mono text-[10px] font-semibold text-slate-400">
          ⌘K
        </kbd>
      </label>
      {open && results.length > 0 ? (
        <div className="absolute right-0 top-full z-40 mt-2 w-[280px] rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl animate-in fade-in duration-150">
          {results.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={`${item.href}-${item.label}`}
                type="button"
                onClick={() => go(item.href)}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-primary transition-colors"
              >
                <Icon className="size-4 text-primary" />
                {item.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export function DashboardShell({
  children,
  title,
  description,
  active = "Dashboard",
}: DashboardShellProps) {
  const router = useRouter();
  const { systemName } = useBranding();
  const displayTitle = title === "Dashboard" ? "Home" : title;

  const [navOpen, setNavOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [moduleQuery, setModuleQuery] = useState("");
  const [spinning, setSpinning] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const [resizing, setResizing] = useState(false);
  const shellRef = useRef<HTMLDivElement>(null);
  const session = useStoredSession();

  const user = (session?.user ?? {}) as {
    firstName?: string;
    lastName?: string;
    name?: string;
    email?: string;
    avatarUrl?: string;
  };

  const roleText = useMemo(() => {
    if (!session?.accessToken) return null;
    try {
      const base64Url = session.accessToken.split(".")[1];
      if (!base64Url) return null;
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const rawBinary =
        typeof window !== "undefined"
          ? window.atob(base64)
          : Buffer.from(base64, "base64").toString("binary");
      const jsonPayload = decodeURIComponent(
        rawBinary
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
      );
      const payload = JSON.parse(jsonPayload) as { roles?: string[] };
      return payload.roles && payload.roles.length > 0
        ? payload.roles.join(", ")
        : null;
    } catch {
      return null;
    }
  }, [session?.accessToken]);
  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.name ||
    user.email ||
    "Birhanu Baynesagn";
  const initials =
    displayName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "U";

  const { t } = useTranslation();
  const hour = new Date().getHours();
  let greeting = t("dashboard.greetingEvening");
  if (hour < 12) {
    greeting = t("dashboard.greetingMorning");
  } else if (hour < 18) {
    greeting = t("dashboard.greetingAfternoon");
  }

  const { hasModulePermission } = usePermissions();

  const visiblePrimaryNavItems = useMemo(() => {
    return primaryNavItems.filter((item) => {
      if (item.label === "Reports") {
        return hasModulePermission("Reports");
      }
      return true;
    });
  }, [hasModulePermission]);

  const visibleNavSections = useMemo(() => {
    return navSections.filter((section) => hasModulePermission(section.title));
  }, [hasModulePermission]);

  const filteredModules = useMemo(() => {
    const term = moduleQuery.trim().toLowerCase();
    if (!term) return moduleNavItems;
    return moduleNavItems.filter((item) =>
      item.label.toLowerCase().includes(term),
    );
  }, [moduleQuery]);

  const toggleSidebar = () => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 1024px)").matches
    ) {
      setCollapsed((value) => !value);
    } else {
      setNavOpen((value) => !value);
    }
  };

  const refresh = () => {
    setSpinning(true);
    router.refresh();
    window.setTimeout(() => setSpinning(false), 600);
  };

  const signOut = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("betflow-auth");
      window.sessionStorage.removeItem("betflow-auth");
    }
    router.push("/auth");
  };

  // Restore the saved sidebar width, then keep it applied via a CSS variable
  // so the docked sidebar (lg+) and the content padding stay in sync.
  useEffect(() => {
    const saved = Number(window.localStorage.getItem("betflow-sidebar-w"));
    if (saved >= SIDEBAR_MIN && saved <= SIDEBAR_MAX) {
      queueMicrotask(() => setSidebarWidth(saved));
    }
  }, []);

  useEffect(() => {
    shellRef.current?.style.setProperty("--sidebar-w", `${sidebarWidth}px`);
  }, [sidebarWidth]);

  const clampWidth = (x: number) =>
    Math.min(SIDEBAR_MAX, Math.max(SIDEBAR_MIN, Math.round(x)));

  const startResize = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setResizing(true);
    const onMove = (e: PointerEvent) => setSidebarWidth(clampWidth(e.clientX));
    const onUp = (e: PointerEvent) => {
      setResizing(false);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.localStorage.setItem(
        "betflow-sidebar-w",
        String(clampWidth(e.clientX)),
      );
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const nudgeWidth = (delta: number) => {
    setSidebarWidth((w) => {
      const next = clampWidth(w + delta);
      window.localStorage.setItem("betflow-sidebar-w", String(next));
      return next;
    });
  };

  return (
    <div
      ref={shellRef}
      className={cn(
        "min-h-screen bg-[#e9edf5] text-[#071426]",
        resizing && "cursor-col-resize select-none",
      )}
    >
      {navOpen ? (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setNavOpen(false)}
        />
      ) : null}

      <aside
        data-collapsed={collapsed ? "true" : "false"}
        className={cn(
          "group/side fixed inset-y-0 left-0 z-40 flex w-60 flex-col bg-sidebar text-white lg:translate-x-0",
          !resizing && "transition-all duration-200",
          navOpen ? "translate-x-0" : "-translate-x-full",
          collapsed ? "lg:w-14" : "lg:w-[var(--sidebar-w,240px)]",
        )}
      >
        <div className="flex h-12 items-center justify-between px-3 group-data-[collapsed=true]/side:lg:justify-center group-data-[collapsed=true]/side:lg:px-0">
          <Link
            href="/dashboard"
            className="flex min-w-0 items-center gap-2"
            onClick={() => setNavOpen(false)}
          >
            <Image
              src="/betflow-mark.svg"
              alt="BetFlow"
              width={30}
              height={30}
              className="rounded-md"
              priority
            />
            <span className="truncate text-[16px] font-semibold group-data-[collapsed=true]/side:lg:hidden">
              {systemName}
            </span>
          </Link>
        </div>

        <nav className="space-y-1 px-2 pb-2">
          {visiblePrimaryNavItems.map((item) => (
            <SidebarLink
              key={item.href}
              item={item}
              active={active}
              onNavigate={() => setNavOpen(false)}
            />
          ))}
        </nav>

        {/* Quick Create Shortcut Dropdown directly inside Sidebar */}
        <div className="px-2 pb-2 group-data-[collapsed=true]/side:lg:px-1">
          <Dropdown
            trigger={
              <button
                type="button"
                className="flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-white/10 border border-white/15 px-2.5 text-xs sm:text-[13.5px] font-bold text-white transition-all duration-150 hover:bg-white/20 hover:border-white/30 group-data-[collapsed=true]/side:lg:px-0 cursor-pointer shadow-2xs"
                title="Quick Create"
              >
                <Plus className="size-4.5 shrink-0 text-[#70a0ff]" />
                <span className="truncate group-data-[collapsed=true]/side:lg:hidden">
                  Quick Create
                </span>
              </button>
            }
            align="start"
            panelClassName="w-[200px]"
          >
            <div className="p-1 space-y-0.5">
              {createItems.map((item) => (
                <MenuLink key={item.label} href={item.href} icon={item.icon}>
                  {item.label}
                </MenuLink>
              ))}
            </div>
          </Dropdown>
        </div>

        <div className="flex min-h-0 flex-1 flex-col border-t border-white/14 px-2 pt-2">
          <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
            {visibleNavSections.flatMap((section) => section.items).map((item) => (
              <SidebarLink
                key={item.href}
                item={item}
                active={active}
                onNavigate={() => setNavOpen(false)}
              />
            ))}
          </nav>
        </div>

        {/* Account + sign out, pinned to the bottom of the sidebar */}
        <div className="mt-auto shrink-0 border-t border-white/14 p-2.5">
          <div className="flex items-center justify-between gap-2 group-data-[collapsed=true]/side:lg:flex-col group-data-[collapsed=true]/side:lg:gap-2">
            <div className="flex min-w-0 items-center gap-2.5 group-data-[collapsed=true]/side:lg:justify-center">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={displayName}
                  className="size-9 shrink-0 rounded-full object-cover border border-white/20 shadow-xs"
                />
              ) : (
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#2563eb] text-xs font-bold text-white shadow-xs">
                  {initials}
                </span>
              )}
              <div className="min-w-0 group-data-[collapsed=true]/side:lg:hidden">
                <p className="truncate text-[14px] font-bold text-white leading-tight">
                  {displayName}
                </p>
                <p className="truncate text-[12px] font-medium text-[#9fb0cd] mt-0.5">
                  {roleText || user.email || "Agent"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Link
                href="/settings"
                title="Settings"
                className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-[#91a1bd] hover:bg-white/15 hover:border-white/30 hover:text-white transition-all duration-150 cursor-pointer shadow-2xs"
              >
                <Settings className="size-4.5 shrink-0" />
              </Link>
              <button
                type="button"
                onClick={signOut}
                title={t("actions.signOut")}
                className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-[#f472b6] hover:bg-white/15 hover:border-white/30 hover:text-white transition-all duration-150 cursor-pointer shadow-2xs"
              >
                <LogOut className="size-4.5 shrink-0" />
              </button>
            </div>
          </div>
        </div>

        {/* Drag handle: resize the docked sidebar left/right (desktop only) */}
        <button
          type="button"
          aria-label={`Resize sidebar, currently ${sidebarWidth} pixels`}
          onPointerDown={startResize}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") {
              event.preventDefault();
              nudgeWidth(-16);
            } else if (event.key === "ArrowRight") {
              event.preventDefault();
              nudgeWidth(16);
            }
          }}
          className={cn(
            "absolute inset-y-0 -right-1 z-50 hidden w-2 cursor-col-resize touch-none outline-none lg:block",
            "group-data-[collapsed=true]/side:lg:hidden",
            "after:absolute after:inset-y-0 after:left-1/2 after:w-0.5 after:-translate-x-1/2 after:bg-transparent after:transition-colors hover:after:bg-[#70a0ff]/70 focus-visible:after:bg-[#70a0ff]",
            resizing && "after:bg-[#70a0ff]",
          )}
        />
      </aside>

      <div
        className={cn(
          !resizing && "transition-[padding] duration-200",
          collapsed ? "lg:pl-14" : "lg:pl-[var(--sidebar-w,240px)]",
        )}
      >
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-md shadow-2xs">
          <div className="flex h-13 items-center justify-between gap-4 px-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                aria-label="Toggle navigation"
                onClick={toggleSidebar}
              >
                <Menu className="size-4" />
              </Button>
              <div className="min-w-0 flex items-center gap-2.5">
                <h1 className="truncate text-base sm:text-lg font-extrabold tracking-tight text-slate-900">
                  {displayTitle}
                </h1>
                {roleText ? (
                  <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 border border-slate-200">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    {roleText}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="flex min-w-0 items-center justify-end gap-2">
              <SearchRecords />
              <LanguageSwitcher variant="light" />

              {/* Quick Create Button with Text Label */}
              <Dropdown
                trigger={
                  <Button
                    type="button"
                    className="h-8 font-bold text-xs px-3 rounded-lg shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    aria-label="Create record"
                  >
                    <Plus className="size-3.5" />
                    <span className="hidden sm:inline">Create</span>
                  </Button>
                }
              >
                <p className="px-2.5 pb-1 pt-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Quick Create
                </p>
                {createItems.map((item) => (
                  <MenuLink key={item.label} href={item.href} icon={item.icon}>
                    {item.label}
                  </MenuLink>
                ))}
              </Dropdown>

              {/* Utility Nav Buttons */}
              <Link
                href="/site-visits"
                aria-label="Meetings"
                title="Site Visits & Meetings"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon" }),
                  "hidden text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg sm:inline-flex relative",
                )}
              >
                <CalendarDays className="size-4" />
              </Link>
              <Link
                href="/transactions?tab=reservations"
                aria-label="Reservations"
                title="Property Reservations"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon" }),
                  "hidden text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg sm:inline-flex relative",
                )}
              >
                <ShoppingBag className="size-4" />
                <span className="absolute top-1 right-1 size-1.5 rounded-full bg-emerald-500" />
              </Link>
              <Link
                href="/settings"
                aria-label="Settings"
                title="System Settings"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon" }),
                  "hidden text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg md:inline-flex",
                )}
              >
                <Settings className="size-4" />
              </Link>

              {/* User Profile Avatar */}
              <Dropdown
                trigger={
                  <button
                    type="button"
                    aria-label="Account"
                    className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-[#233b66] to-[#3b5e9a] text-white font-extrabold text-xs shadow-xs border border-white ring-1 ring-slate-200 hover:scale-105 transition-transform overflow-hidden"
                  >
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={displayName}
                        className="size-full object-cover"
                      />
                    ) : (
                      initials
                    )}
                  </button>
                }
              >
                <div className="border-b border-slate-100 px-3 py-2">
                  <p className="truncate text-xs font-bold text-slate-900">
                    {displayName}
                  </p>
                  {roleText ? (
                    <p className="truncate text-[11px] text-slate-500 font-medium">
                      {roleText}
                    </p>
                  ) : user.email ? (
                    <p className="truncate text-[11px] text-slate-500 font-medium">
                      {user.email}
                    </p>
                  ) : null}
                </div>
                <div className="pt-1">
                  <MenuLink href="/settings" icon={UserRound}>
                    Account settings
                  </MenuLink>
                  <MenuButton icon={LogOut} onClick={signOut} danger>
                    Sign out
                  </MenuButton>
                </div>
              </Dropdown>

              {/* Modules Grid Dropdown */}
              <Dropdown
                align="end"
                panelClassName="w-[260px]"
                trigger={
                  <button
                    type="button"
                    aria-label="All modules"
                    className="hidden size-8 items-center justify-center rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 sm:flex transition-colors"
                  >
                    <Grip className="size-4.5" />
                  </button>
                }
              >
                <p className="px-2.5 pb-1 pt-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Modules
                </p>
                <div className="grid grid-cols-3 gap-1">
                  {moduleNavItems.map((item) => (
                    <ModuleGridLink
                      key={`${item.href}-${item.label}`}
                      item={item}
                    />
                  ))}
                </div>
              </Dropdown>
            </div>
          </div>
        </header>

        {active === "Dashboard" ? (
          <div className="relative overflow-hidden bg-gradient-to-r from-[#172744] via-[#233b66] to-[#1e345b] text-white px-4 py-4 sm:px-6 shadow-sm border-b border-[#2e477a]">
            {/* Subtle visual glow accent */}
            <div className="pointer-events-none absolute -right-10 -top-10 size-48 rounded-full bg-primary/10 blur-2xl" />

            <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3.5">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-lg sm:text-xl font-extrabold tracking-tight text-white">
                      {greeting}, {displayName.split(" ")[0]}!
                    </h2>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-400/30">
                      <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Live Pipeline Active
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-xs font-medium text-slate-300">
                    Here&apos;s what&apos;s happening with your real estate pipeline today.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 px-3 text-xs font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/15 backdrop-blur-xs rounded-lg shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
                  aria-label="Refresh"
                  onClick={refresh}
                >
                  <RotateCw
                    className={cn("size-3.5", spinning && "animate-spin")}
                  />
                  <span className="hidden sm:inline">Refresh</span>
                </Button>

                <Dropdown
                  align="end"
                  trigger={
                    <button
                      type="button"
                      className="h-9 items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3.5 text-xs font-bold text-white hover:bg-white/20 backdrop-blur-xs shadow-2xs flex transition-all cursor-pointer"
                    >
                      <span className="truncate max-w-[130px] sm:max-w-none">{displayName.split(" ")[0]}&apos;s Command Center</span>
                      <ChevronDown className="size-3.5 text-slate-300" />
                    </button>
                  }
                >
                  <MenuLink href="/dashboard" icon={Home}>
                    Command Center Home
                  </MenuLink>
                  <MenuLink href="/reports/sales" icon={BarChart3}>
                    Sales Reports
                  </MenuLink>
                  <MenuLink href="/pipeline" icon={UserRoundCheck}>
                    Sales Pipeline
                  </MenuLink>
                </Dropdown>

                <Dropdown
                  align="end"
                  trigger={
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-9 border-white/20 bg-white/10 text-white hover:bg-white/20 backdrop-blur-xs rounded-lg shadow-2xs cursor-pointer"
                      aria-label="More actions"
                    >
                      <MoreHorizontal className="size-4" />
                    </Button>
                  }
                >
                  <MenuButton icon={RotateCw} onClick={refresh}>
                    Refresh Dashboard Data
                  </MenuButton>
                  <MenuLink href="/settings" icon={Settings}>
                    Settings
                  </MenuLink>
                </Dropdown>
              </div>
            </div>
          </div>
        ) : null}

        <main className="px-3 py-4 sm:px-6 lg:px-8 w-full max-w-full overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
