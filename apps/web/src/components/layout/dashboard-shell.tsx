"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ElementType,
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
  UserRound,
  UserRoundCheck,
  UsersRound,
} from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  { label: "Reports", href: "/reports", icon: BarChart3, aliases: ["Sales report"] },
];

const moduleNavItems = [
  { label: "Leads", href: "/leads", icon: UserRoundCheck },
  { label: "Contacts", href: "/customers", icon: UsersRound, aliases: ["Customers"] },
  { label: "Accounts", href: "/properties", icon: Building, aliases: ["Properties"] },
  { label: "Deals", href: "/deals", icon: CircleDollarSign},
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

const createItems = [
  { label: "New Lead", href: "/leads", icon: UserRoundCheck },
  { label: "New Contact", href: "/customers", icon: UsersRound },
  { label: "New Deal", href: "/deals", icon: CircleDollarSign },
  { label: "New Task", href: "/tasks", icon: ClipboardList },
  { label: "New Meeting", href: "/site-visits", icon: CalendarDays },
];

const searchIndex = [...primaryNavItems, ...moduleNavItems, ...utilityNavItems];

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

function SidebarLink({
  item,
  active,
  onNavigate,
}: {
  item: NavItem;
  active: string;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  const isActive = isActiveItem(item, active);

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      title={item.label}
      className={cn(
        "flex h-[30px] items-center gap-3 rounded px-2.5 text-[14px] font-medium text-[#e8efff] transition hover:bg-white/10",
        "group-data-[collapsed=true]/side:lg:justify-center group-data-[collapsed=true]/side:lg:px-0",
        isActive && "bg-white/10 text-white",
      )}
    >
      <Icon className={cn("size-4 shrink-0 text-[#91a1bd]", isActive && "text-[#70a0ff]")} />
      <span className="truncate group-data-[collapsed=true]/side:lg:hidden">{item.label}</span>
    </Link>
  );
}

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

  return (
    <div ref={ref} className="relative">
      <div
        role="button"
        tabIndex={0}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex"
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setOpen((value) => !value);
          }
        }}
      >
        {trigger}
      </div>
      {open ? (
        <div
          role="menu"
          onClick={() => setOpen(false)}
          className={cn(
            "absolute top-full z-40 mt-2 min-w-[220px] rounded-lg border border-[#dbe2ee] bg-white p-1.5 shadow-[0_14px_34px_rgba(15,32,60,0.16)]",
            align === "end" ? "right-0" : "left-0",
            panelClassName,
          )}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

function MenuLink({ href, icon: Icon, children }: { href: string; icon: ElementType; children: ReactNode }) {
  return (
    <Link
      href={href}
      role="menuitem"
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
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm hover:bg-[#eef2fb]",
        danger ? "text-[#c02a4a] hover:bg-[#fdeef1]" : "text-[#243350]",
      )}
    >
      <Icon className={cn("size-4", danger ? "text-[#c02a4a]" : "text-[#6a789a]")} />
      {children}
    </button>
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
    return searchIndex.filter((item) => item.label.toLowerCase().includes(term)).slice(0, 6);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
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
      <label className="flex h-8 w-[235px] items-center gap-2 rounded-md bg-[#edf1f8] px-3 text-[#6b7a94]">
        <Search className="size-4" />
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
          className="w-full bg-transparent text-sm text-[#1f2d45] outline-none placeholder:text-[#6b7a94]"
          placeholder="Search records"
        />
      </label>
      {open && results.length > 0 ? (
        <div className="absolute right-0 top-full z-40 mt-2 w-[280px] rounded-lg border border-[#dbe2ee] bg-white p-1.5 shadow-[0_14px_34px_rgba(15,32,60,0.16)]">
          {results.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={`${item.href}-${item.label}`}
                type="button"
                onClick={() => go(item.href)}
                className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm text-[#243350] hover:bg-[#eef2fb]"
              >
                <Icon className="size-4 text-[#6a789a]" />
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
  const displayTitle = title === "Dashboard" ? "Home" : title;

  const [navOpen, setNavOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [moduleQuery, setModuleQuery] = useState("");
  const [spinning, setSpinning] = useState(false);
  const session = useStoredSession();

  const user = (session?.user ?? {}) as {
    firstName?: string;
    lastName?: string;
    name?: string;
    email?: string;
  };
  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.name ||
    user.email ||
    "Birhanu Baynesagn";

  const filteredModules = useMemo(() => {
    const term = moduleQuery.trim().toLowerCase();
    if (!term) return moduleNavItems;
    return moduleNavItems.filter((item) => item.label.toLowerCase().includes(term));
  }, [moduleQuery]);

  const toggleSidebar = () => {
    if (typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches) {
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

  return (
    <div className="min-h-screen bg-[#e9edf5] text-[#071426]">
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
          "group/side fixed inset-y-0 left-0 z-40 w-60 bg-[#233b66] text-white transition-all duration-200 lg:translate-x-0",
          navOpen ? "translate-x-0" : "-translate-x-full",
          collapsed ? "lg:w-14" : "lg:w-60",
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
              BetFlow CRM
            </span>
          </Link>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-[#cbd7ef] hover:bg-white/10 hover:text-white group-data-[collapsed=true]/side:lg:hidden"
            aria-label="Collapse navigation"
            onClick={toggleSidebar}
          >
            <Menu className="size-4" />
          </Button>
        </div>

        <nav className="space-y-1 px-2 pb-3">
          {primaryNavItems.map((item) => (
            <SidebarLink key={item.href} item={item} active={active} onNavigate={() => setNavOpen(false)} />
          ))}
        </nav>

        <div className="border-t border-white/14 px-2 pt-3">
          <div className="mb-2 flex items-center gap-2 px-1 text-[15px] font-semibold text-white group-data-[collapsed=true]/side:lg:justify-center group-data-[collapsed=true]/side:lg:px-0">
            <div className="grid size-5 grid-cols-2 gap-0.5 rounded bg-[#ff4e96] p-0.5">
              <span className="rounded-sm bg-white/70" />
              <span className="rounded-sm bg-white/70" />
              <span className="rounded-sm bg-white/70" />
              <span className="rounded-sm bg-white/70" />
            </div>
            <span className="group-data-[collapsed=true]/side:lg:hidden">Modules</span>
          </div>
          <label className="mb-3 flex h-8 items-center gap-2 rounded-md border border-white/18 px-2 text-[#b7c5dd] group-data-[collapsed=true]/side:lg:hidden">
            <Search className="size-4" />
            <input
              aria-label="Search modules"
              value={moduleQuery}
              onChange={(event) => setModuleQuery(event.target.value)}
              className="w-full bg-transparent text-sm outline-none placeholder:text-[#b7c5dd]"
              placeholder="Search"
            />
          </label>
          <nav className="max-h-[calc(100vh-220px)] space-y-1 overflow-y-auto pr-1">
            {filteredModules.map((item) => (
              <SidebarLink
                key={`${item.href}-${item.label}`}
                item={item}
                active={active}
                onNavigate={() => setNavOpen(false)}
              />
            ))}
            {moduleQuery.trim() === "" ? (
              <>
                <div className="my-2 border-t border-white/14" />
                {utilityNavItems.map((item) => (
                  <SidebarLink key={item.href} item={item} active={active} onNavigate={() => setNavOpen(false)} />
                ))}
              </>
            ) : null}
            {filteredModules.length === 0 ? (
              <p className="px-2.5 py-2 text-sm text-[#93a3c1]">No modules found</p>
            ) : null}
          </nav>
        </div>
      </aside>

      <div className={cn("transition-[padding] duration-200", collapsed ? "lg:pl-14" : "lg:pl-60")}>
        <header className="sticky top-0 z-10 border-b border-[#d4dceb] bg-white">
          <div className="flex h-12 items-center justify-between gap-4 px-4">
            <div className="flex min-w-0 items-center gap-3">
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-[#314466] hover:bg-[#edf2fb]"
                aria-label="Toggle navigation"
                onClick={toggleSidebar}
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
              <SearchRecords />

              <Dropdown
                trigger={
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8 border-[#4569ff] text-[#4569ff]"
                    aria-label="Create record"
                  >
                    <Plus className="size-4" />
                  </Button>
                }
              >
                <p className="px-2.5 pb-1 pt-1 text-xs font-semibold uppercase tracking-wide text-[#8b98b1]">
                  Create
                </p>
                {createItems.map((item) => (
                  <MenuLink key={item.label} href={item.href} icon={item.icon}>
                    {item.label}
                  </MenuLink>
                ))}
              </Dropdown>

              <Link
                href="/site-visits"
                aria-label="Meetings"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon" }),
                  "hidden text-[#53627b] hover:bg-[#edf2fb] sm:inline-flex",
                )}
              >
                <CalendarDays className="size-4" />
              </Link>
              <Link
                href="/reservations"
                aria-label="Reservations"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon" }),
                  "hidden text-[#53627b] hover:bg-[#edf2fb] sm:inline-flex",
                )}
              >
                <ShoppingBag className="size-4" />
              </Link>
              <Link
                href="/settings"
                aria-label="Settings"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon" }),
                  "hidden text-[#53627b] hover:bg-[#edf2fb] md:inline-flex",
                )}
              >
                <Settings className="size-4" />
              </Link>

              <Dropdown
                trigger={
                  <button
                    type="button"
                    aria-label="Account"
                    className="hidden size-8 items-center justify-center rounded-full bg-[#dce3ef] text-[#7a879b] sm:flex"
                  >
                    <UserCircle className="size-7" />
                  </button>
                }
              >
                <div className="border-b border-[#eef1f7] px-2.5 pb-2 pt-1">
                  <p className="truncate text-sm font-semibold text-[#1f2d45]">{displayName}</p>
                  {user.email ? (
                    <p className="truncate text-xs text-[#8b98b1]">{user.email}</p>
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

              <Dropdown
                align="end"
                panelClassName="w-[260px]"
                trigger={
                  <button
                    type="button"
                    aria-label="All modules"
                    className="hidden size-8 items-center justify-center rounded-md text-[#3c485c] hover:bg-[#edf2fb] sm:flex"
                  >
                    <Grip className="size-5" />
                  </button>
                }
              >
                <p className="px-2.5 pb-1 pt-1 text-xs font-semibold uppercase tracking-wide text-[#8b98b1]">
                  Modules
                </p>
                <div className="grid grid-cols-3 gap-1">
                  {moduleNavItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={`${item.href}-${item.label}`}
                        href={item.href}
                        className="flex flex-col items-center gap-1 rounded-md px-1 py-2 text-center text-[11px] text-[#3d4a63] hover:bg-[#eef2fb]"
                      >
                        <Icon className="size-4 text-[#5a6a88]" />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </Dropdown>
            </div>
          </div>
        </header>

        <div className="flex h-[56px] items-center justify-between gap-3 border-b border-[#d9e1ee] bg-[#eef2f8] px-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-md border border-[#d5deeb] bg-[#e3e9f2] text-[#9badc5]">
              <Building2 className="size-7" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[18px] font-semibold">Welcome {displayName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-[#25354d] hover:bg-white"
              aria-label="Refresh"
              onClick={refresh}
            >
              <RotateCw className={cn("size-4", spinning && "animate-spin")} />
            </Button>
            <Dropdown
              align="end"
              trigger={
                <button
                  type="button"
                  className="hidden h-9 items-center gap-3 rounded-md border border-[#c2cad8] bg-white px-4 text-sm text-[#071426] lg:flex"
                >
                  {displayName}&apos;s Home
                  <ChevronDown className="size-4 text-[#67758d]" />
                </button>
              }
            >
              <MenuLink href="/dashboard" icon={Home}>
                Home
              </MenuLink>
              <MenuLink href="/reports/sales" icon={BarChart3}>
                Sales reports
              </MenuLink>
              <MenuLink href="/leads" icon={UserRoundCheck}>
                Leads pipeline
              </MenuLink>
            </Dropdown>
            <Dropdown
              align="end"
              trigger={
                <Button
                  variant="outline"
                  size="icon"
                  className="size-9 border-[#cbd4e2] bg-[#f7f9fd]"
                  aria-label="More actions"
                >
                  <MoreHorizontal className="size-5" />
                </Button>
              }
            >
              <MenuButton icon={RotateCw} onClick={refresh}>
                Refresh
              </MenuButton>
              <MenuLink href="/settings" icon={Settings}>
                Settings
              </MenuLink>
            </Dropdown>
          </div>
        </div>

        <main className="px-3 py-3 sm:px-4">{children}</main>
      </div>
    </div>
  );
}
