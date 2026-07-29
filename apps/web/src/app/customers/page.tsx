"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { Plus, Trash2, X, Search, ChevronDown, ChevronRight, Filter, RotateCcw } from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";

type ApiCustomer = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  createdAt: string;
  _count: { deals: number; contracts: number; reservations: number };
};

type NewCustomer = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

const EMPTY_FORM: NewCustomer = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
};

// Interactive Sidebar Accordion Component
function FilterAccordion({
  title,
  items,
  defaultOpen = false,
  selectedFilters,
  onToggleFilter,
  filterSearch,
}: {
  title: string;
  items: string[];
  defaultOpen?: boolean;
  selectedFilters: Set<string>;
  onToggleFilter: (item: string) => void;
  filterSearch: string;
}) {
  const [open, setOpen] = useState(defaultOpen);

  const filteredItems = useMemo(() => {
    if (!filterSearch.trim()) return items;
    return items.filter((item) =>
      item.toLowerCase().includes(filterSearch.trim().toLowerCase())
    );
  }, [items, filterSearch]);

  useEffect(() => {
    if (filterSearch.trim() && filteredItems.length > 0) {
      setOpen(true);
    }
  }, [filterSearch, filteredItems.length]);

  if (filterSearch.trim() && filteredItems.length === 0) {
    return null;
  }

  const selectedCount = items.filter((item) => selectedFilters.has(item)).length;

  return (
    <div className="border-b border-zinc-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-2.5 text-sm font-semibold text-zinc-800 hover:bg-zinc-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          {open ? <ChevronDown className="size-4 text-zinc-500" /> : <ChevronRight className="size-4 text-zinc-500" />}
          <span>{title}</span>
        </div>
        {selectedCount > 0 && (
          <span className="size-5 rounded-full bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center">
            {selectedCount}
          </span>
        )}
      </button>
      {open && (
        <div className="px-4 pb-3 pt-1 space-y-1">
          {filteredItems.map((item) => {
            const isChecked = selectedFilters.has(item);
            return (
              <label
                key={item}
                className={cn(
                  "flex items-center gap-2.5 cursor-pointer group rounded px-2 py-1.5 transition-colors select-none",
                  isChecked ? "bg-indigo-50/80" : "hover:bg-zinc-100/70"
                )}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onToggleFilter(item)}
                  className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 size-3.5 cursor-pointer accent-indigo-600"
                />
                <span
                  className={cn(
                    "text-[13px] transition-colors",
                    isChecked ? "text-indigo-950 font-medium" : "text-zinc-600 group-hover:text-zinc-900"
                  )}
                >
                  {item}
                </span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ContactsPage() {
  const [customers, setCustomers] = useState<ApiCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<NewCustomer>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // Filter state
  const [selectedFilters, setSelectedFilters] = useState<Set<string>>(new Set());
  const [filterSearch, setFilterSearch] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);

  // Row selection state
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<ApiCustomer[]>("/customers");
      setCustomers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load contacts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await apiFetch<ApiCustomer>("/customers", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setForm(EMPTY_FORM);
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create contact");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!window.confirm("Are you sure you want to delete this contact?")) return;
    setError(null);
    try {
      await apiFetch(`/customers/${id}`, { method: "DELETE" });
      setCustomers((prev) => prev.filter((c) => c.id !== id));
      setSelectedRowIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete contact");
      await load();
    }
  };

  const handleToggleFilter = (item: string) => {
    setSelectedFilters((prev) => {
      const next = new Set(prev);
      if (next.has(item)) {
        next.delete(item);
      } else {
        next.add(item);
      }
      return next;
    });
  };

  const clearAllFilters = () => {
    setSelectedFilters(new Set());
    setFilterSearch("");
  };

  // Compute filtered customers based on selected checkboxes and filter search text
  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      // 1. Text search filter
      const searchLower = filterSearch.trim().toLowerCase();
      if (searchLower) {
        const matchesContact =
          customer.firstName.toLowerCase().includes(searchLower) ||
          customer.lastName.toLowerCase().includes(searchLower) ||
          (customer.email ?? "").toLowerCase().includes(searchLower) ||
          (customer.phone ?? "").toLowerCase().includes(searchLower);

        // Check if search matches any filter item name
        const filterItemNames = [
          "Activities", "Campaigns", "Latest Email Status", "Record Action",
          "Related Records Action", "Touched Records", "Untouched Records",
          "Account Name", "Assistant", "Asst Phone", "Contact Owner", "Created By",
          "Created Time", "Date of Birth", "Department", "Email", "Email Opt Out",
          "Fax", "First Name", "Home Phone", "Last Activity Time", "Last Name",
          "Lead Source", "Mobile", "Modified By", "Modified Time", "Phone", "Title",
          "Calls", "Cases", "Deals", "Emails", "Invoices", "Leads", "Meetings", "Notes", "Tasks"
        ];
        const matchesFilterName = filterItemNames.some((name) =>
          name.toLowerCase().includes(searchLower)
        );

        if (!matchesFilterName && !matchesContact) {
          return false;
        }
      }

      // 2. Checkbox filters logic
      if (selectedFilters.size > 0) {
        for (const filter of selectedFilters) {
          switch (filter) {
            case "Activities":
              if (customer._count.deals === 0 && customer._count.contracts === 0 && customer._count.reservations === 0) return false;
              break;
            case "Campaigns":
            case "Touched Records":
              if (!customer.email && !customer.phone) return false;
              break;
            case "Untouched Records":
              if (customer.email || customer.phone) return false;
              break;
            case "Latest Email Status":
            case "Email":
            case "Email Opt Out":
            case "Secondary Email":
            case "Emails":
              if (!customer.email) return false;
              break;
            case "Phone":
            case "Mobile":
            case "Home Phone":
            case "Asst Phone":
            case "Other Phone":
            case "Fax":
              if (!customer.phone) return false;
              break;
            case "First Name":
              if (!customer.firstName) return false;
              break;
            case "Last Name":
              if (!customer.lastName) return false;
              break;
            case "Deals":
            case "Deal Contact Role (Contact Roles)":
              if (customer._count.deals === 0) return false;
              break;
            case "Contracts":
              if (customer._count.contracts === 0) return false;
              break;
            case "Reservations":
              if (customer._count.reservations === 0) return false;
              break;
            default:
              break;
          }
        }
      }

      return true;
    });
  }, [customers, selectedFilters, filterSearch]);

  // Row selection logic
  const allRowsSelected =
    filteredCustomers.length > 0 &&
    filteredCustomers.every((c) => selectedRowIds.has(c.id));

  const toggleSelectAllRows = () => {
    if (allRowsSelected) {
      setSelectedRowIds(new Set());
    } else {
      setSelectedRowIds(new Set(filteredCustomers.map((c) => c.id)));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedRowIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkDelete = async () => {
    if (selectedRowIds.size === 0) return;
    const count = selectedRowIds.size;
    if (!window.confirm(`Are you sure you want to delete ${count} selected contact(s)?`)) return;
    setError(null);
    const ids = Array.from(selectedRowIds);
    try {
      await Promise.all(
        ids.map((id) =>
          apiFetch(`/customers/${id}`, { method: "DELETE" }).catch((err) => {
            console.error(`Failed to delete customer ${id}:`, err);
            return null;
          })
        )
      );
      setCustomers((prev) => prev.filter((c) => !selectedRowIds.has(c.id)));
      setSelectedRowIds(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete selected contacts");
      await load();
    }
  };

  return (
    <DashboardShell
      title="Customers"
      description="Manage property buyers, client records, and customer relationships."
      active="Customers"
    >
      <div className="flex h-[calc(100vh-160px)] gap-0 overflow-hidden rounded-md border border-zinc-200 bg-white shadow-sm">
        
        {/* Left Pane: Filters Sidebar */}
        {showSidebar && (
          <div className="w-[280px] flex-shrink-0 border-r border-zinc-200 bg-[#f8f9fa] flex flex-col hidden md:flex">
            <div className="p-4 border-b border-zinc-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-zinc-800">
                  Filter Customers by
                  {selectedFilters.size > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-[#233b66] text-white">
                      {selectedFilters.size}
                    </span>
                  )}
                </h3>
                {(selectedFilters.size > 0 || filterSearch) && (
                  <button
                    onClick={clearAllFilters}
                    className="text-xs font-medium text-[#233b66] hover:text-[#1d3257] flex items-center gap-1"
                    title="Clear all filters"
                  >
                    <RotateCcw className="size-3" />
                    Reset
                  </button>
                )}
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 size-4 text-zinc-400" />
                <input 
                  type="text" 
                  value={filterSearch}
                  onChange={(e) => setFilterSearch(e.target.value)}
                  placeholder="Search filters or contacts" 
                  className="w-full rounded border border-zinc-300 bg-white py-2 pl-9 pr-8 text-[13px] text-zinc-900 placeholder:text-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                {filterSearch && (
                  <button
                    onClick={() => setFilterSearch("")}
                    className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-zinc-600"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <FilterAccordion 
                title="System Defined Filters" 
                defaultOpen={true}
                selectedFilters={selectedFilters}
                onToggleFilter={handleToggleFilter}
                filterSearch={filterSearch}
                items={[
                  "Activities",
                  "Campaigns",
                  "Latest Email Status",
                  "Record Action",
                  "Related Records Action",
                  "Touched Records",
                  "Untouched Records"
                ]} 
              />
              <FilterAccordion 
                title="Filter By Fields" 
                selectedFilters={selectedFilters}
                onToggleFilter={handleToggleFilter}
                filterSearch={filterSearch}
                items={[
                  "Account Name",
                  "Assistant",
                  "Asst Phone",
                  "Contact Owner",
                  "Created By",
                  "Created Time",
                  "Date of Birth",
                  "Department",
                  "Email",
                  "Email Opt Out",
                  "Fax",
                  "First Name",
                  "Home Phone",
                  "Last Activity Time",
                  "Last Name",
                  "Lead Source",
                  "Mailing Address",
                  "Mailing Address - City",
                  "Mailing Address - Country / Region",
                  "Mailing Address - Flat / House No./ Building / Apartment Name",
                  "Mailing Address - State / Province",
                  "Mailing Address - Street Address",
                  "Mailing Address - Zip / Postal Code",
                  "Mobile",
                  "Modified By",
                  "Modified Time",
                  "Other Address",
                  "Other Address - City",
                  "Other Address - Country / Region",
                  "Other Address - Flat / House No./ Building / Apartment Name",
                  "Other Address - State / Province",
                  "Other Address - Street Address",
                  "Other Address - Zip / Postal Code",
                  "Other Phone",
                  "Phone",
                  "Reporting To",
                  "Salutation",
                  "Secondary Email",
                  "Skype ID",
                  "Title",
                  "Twitter",
                  "Unsubscribed Mode",
                  "Unsubscribed Time"
                ]} 
              />
              <FilterAccordion 
                title="Filter By Related Modules" 
                defaultOpen={true}
                selectedFilters={selectedFilters}
                onToggleFilter={handleToggleFilter}
                filterSearch={filterSearch}
                items={[
                  "Calls",
                  "Cases",
                  "Contacts (Reporting Contacts)",
                  "Deal Contact Role (Contact Roles)",
                  "Deals",
                  "Emails",
                  "Invitees (Invited Meetings)",
                  "Invoices",
                  "Leads (Converted Leads)",
                  "Meetings",
                  "Notes",
                  "Purchase Orders",
                  "Quotes",
                  "Sales Orders",
                  "Tasks"
                ]} 
              />
            </div>
          </div>
        )}

        {/* Right Pane: Main Content */}
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          
          {/* Top Header Row */}
          <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3 h-[60px]">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant={showSidebar ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setShowSidebar(!showSidebar)}
                  className="h-8 text-[13px] font-medium border-zinc-300 text-zinc-700 relative"
                >
                  <Filter className="size-3.5 mr-1" />
                  Filter
                  {selectedFilters.size > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.2 bg-indigo-600 text-white rounded-full text-[10px] font-bold">
                      {selectedFilters.size}
                    </span>
                  )}
                </Button>
                <div className="h-4 w-px bg-zinc-300 mx-1"></div>
                <Button variant="ghost" size="sm" className="h-8 text-[13px] font-medium text-zinc-700">
                  All Customers <ChevronDown className="size-3.5 ml-1" />
                </Button>
              </div>

              {selectedRowIds.size > 0 && (
                <div className="flex items-center gap-2 bg-[#233b66]/10 border border-[#233b66]/20 rounded px-2.5 py-1">
                  <span className="text-xs font-semibold text-[#233b66]">
                    {selectedRowIds.size} selected
                  </span>
                  <button
                    onClick={handleBulkDelete}
                    className="text-xs text-red-600 hover:text-red-800 font-medium flex items-center gap-1 hover:underline ml-2"
                  >
                    <Trash2 className="size-3" />
                    Delete
                  </button>
                </div>
              )}
            </div>
            <Button 
              onClick={() => setShowForm((value) => !value)} 
              size="sm" className="h-8 bg-[#233b66] hover:bg-[#1d3257] text-white rounded shadow-sm text-[13px] px-4 font-medium">
              <Plus className="size-3.5 mr-1" />
              {showForm ? "Cancel" : "Create Customer"}
            </Button>
          </div>

          {/* Active Filter Chips */}
          {selectedFilters.size > 0 && (
            <div className="flex items-center flex-wrap gap-2 px-4 py-2 bg-indigo-50/40 border-b border-zinc-200 text-xs">
              <span className="font-semibold text-zinc-600">Active Filters:</span>
              {Array.from(selectedFilters).map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-medium bg-indigo-100 text-indigo-900 border border-indigo-200"
                >
                  {item}
                  <button
                    onClick={() => handleToggleFilter(item)}
                    className="hover:bg-indigo-200 rounded-full p-0.5 transition-colors text-indigo-700"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
              <button
                onClick={clearAllFilters}
                className="text-indigo-600 hover:text-indigo-800 font-semibold ml-2 underline underline-offset-2"
              >
                Clear All ({selectedFilters.size})
              </button>
            </div>
          )}

          {/* Creation Form */}
          {showForm && (
            <form
              onSubmit={handleCreate}
              className="grid gap-3 border-b border-zinc-200 bg-indigo-50/50 p-4 sm:grid-cols-4"
            >
              <input
                required
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                placeholder="First name"
                className="h-9 rounded border border-zinc-300 bg-white px-3 text-[13px] shadow-sm"
              />
              <input
                required
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                placeholder="Last name"
                className="h-9 rounded border border-zinc-300 bg-white px-3 text-[13px] shadow-sm"
              />
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Email"
                className="h-9 rounded border border-zinc-300 bg-white px-3 text-[13px] shadow-sm"
              />
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Phone"
                className="h-9 rounded border border-zinc-300 bg-white px-3 text-[13px] shadow-sm"
              />
              <div className="sm:col-span-4 flex justify-end">
                <Button type="submit" disabled={saving} size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                  {saving ? "Saving..." : "Save Customer"}
                </Button>
              </div>
            </form>
          )}

          {error && (
            <p className="border-b border-zinc-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </p>
          )}

          {/* Data Table */}
          <div className="flex-1 overflow-auto custom-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-zinc-500">Loading contacts…</p>
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="rounded-full bg-zinc-50 p-4 mb-3 border border-zinc-100">
                  <Search className="size-6 text-zinc-300" />
                </div>
                <h3 className="text-[15px] font-semibold text-zinc-900">
                  {selectedFilters.size > 0 || filterSearch ? "No matching contacts found" : "No contacts found"}
                </h3>
                <p className="text-[13px] text-zinc-500 mt-1 max-w-sm">
                  {selectedFilters.size > 0 || filterSearch
                    ? "Try clearing or adjusting your sidebar filters to see more contact records."
                    : "You haven't created any contacts yet. Click the 'Create Contact' button to add your first record."}
                </p>
                {(selectedFilters.size > 0 || filterSearch) && (
                  <Button
                    onClick={clearAllFilters}
                    variant="outline"
                    size="sm"
                    className="mt-4 border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            ) : (
              <table className="w-full text-left text-[13px] whitespace-nowrap">
                <thead className="bg-[#f8f9fa] text-zinc-700 font-semibold sticky top-0 border-b border-zinc-200 shadow-sm z-10">
                  <tr>
                    <th className="px-4 py-2.5 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={allRowsSelected}
                        onChange={toggleSelectAllRows}
                        className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-600 size-3.5 cursor-pointer accent-indigo-600"
                      />
                    </th>
                    <th className="px-4 py-2.5">
                      <div className="flex items-center group cursor-pointer hover:text-indigo-600">
                        Contact Name <span className="text-zinc-300 ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity">↓</span>
                      </div>
                    </th>
                    <th className="px-4 py-2.5">Account Name</th>
                    <th className="px-4 py-2.5">Email</th>
                    <th className="px-4 py-2.5">Phone</th>
                    <th className="px-4 py-2.5">Contact Owner</th>
                    <th className="px-4 py-2.5 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredCustomers.map((customer) => {
                    const isSelected = selectedRowIds.has(customer.id);
                    return (
                      <tr
                        key={customer.id}
                        className={cn(
                          "transition-colors group cursor-pointer",
                          isSelected ? "bg-indigo-50/40" : "hover:bg-[#f8f9fa]"
                        )}
                      >
                        <td className="px-4 py-2.5 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectRow(customer.id)}
                            className={cn(
                              "rounded border-zinc-300 text-indigo-600 focus:ring-indigo-600 size-3.5 cursor-pointer accent-indigo-600 transition-opacity",
                              isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                            )}
                          />
                        </td>
                        <td className="px-4 py-2.5">
                          <Link
                            href={`/customers/${customer.id}`}
                            className="font-medium text-indigo-600 hover:text-indigo-800 hover:underline inline-flex items-center gap-1.5"
                          >
                            <div className="size-6 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 text-[10px] font-bold">
                              {customer.firstName[0]}{customer.lastName[0]}
                            </div>
                            {customer.firstName} {customer.lastName}
                          </Link>
                        </td>
                        <td className="px-4 py-2.5 text-zinc-700">BetFlow Deals</td>
                        <td className="px-4 py-2.5 text-zinc-600">{customer.email ?? "—"}</td>
                        <td className="px-4 py-2.5 text-zinc-600">{customer.phone ?? "—"}</td>
                        <td className="px-4 py-2.5 text-zinc-700 flex items-center gap-1.5">
                          <div className="size-5 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-600 text-[9px] font-bold overflow-hidden">
                            BB
                          </div>
                          Birhanu Baynesagn
                        </td>
                        <td className="px-4 py-2.5 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => handleDelete(customer.id, e)}
                            className="text-zinc-400 hover:text-red-600 p-1.5 rounded hover:bg-red-50 transition-colors"
                            title="Delete contact"
                            aria-label="Delete contact"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
          
          {/* Pagination Footer */}
          {filteredCustomers.length > 0 && (
            <div className="flex items-center justify-between border-t border-zinc-200 bg-white px-4 py-2.5 text-xs text-zinc-500">
              <div className="flex items-center gap-4">
                <span>Total Records: {filteredCustomers.length} {filteredCustomers.length !== customers.length && `(Filtered from ${customers.length})`}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="cursor-not-allowed text-zinc-300">{'<'}</span>
                <span className="font-medium text-zinc-700">1 to {filteredCustomers.length}</span>
                <span className="cursor-not-allowed text-zinc-300">{'>'}</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </DashboardShell>
  );
}

