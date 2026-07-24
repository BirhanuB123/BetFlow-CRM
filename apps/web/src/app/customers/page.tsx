"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { Plus, Trash2, X, Search, ChevronDown, ChevronRight, Filter } from "lucide-react";

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

// Sidebar Accordion Component for the Zoho UI
function FilterAccordion({ title, items, defaultOpen = false }: { title: string, items: string[], defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-zinc-100 last:border-0">
      <button 
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-semibold text-zinc-800 hover:bg-zinc-100 transition-colors"
      >
        {open ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
        {title}
      </button>
      {open && (
        <div className="px-4 pb-3 pt-1 space-y-2.5">
          {items.map((item) => (
            <label key={item} className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-600 size-3.5 group-hover:border-indigo-400 transition-colors" />
              <span className="text-[13px] text-zinc-600 group-hover:text-zinc-900">{item}</span>
            </label>
          ))}
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

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this contact?")) return;
    setError(null);
    try {
      await apiFetch(`/customers/${id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete contact");
    }
  };

  return (
    <DashboardShell
      title="Contacts"
      description="Converted relationships and account ownership."
      active="Customers"
    >
      <div className="flex h-[calc(100vh-160px)] gap-0 overflow-hidden rounded-md border border-zinc-200 bg-white shadow-sm">
        
        {/* Left Pane: Filters Sidebar */}
        <div className="w-[280px] flex-shrink-0 border-r border-zinc-200 bg-[#f8f9fa] flex flex-col hidden md:flex">
          <div className="p-4 border-b border-zinc-200">
            <h3 className="text-sm font-semibold text-zinc-800 mb-3">Filter Contacts by</h3>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 size-4 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Search" 
                className="w-full rounded border border-zinc-300 bg-white py-2 pl-9 pr-3 text-[13px] text-zinc-900 placeholder:text-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <FilterAccordion 
              title="System Defined Filters" 
              defaultOpen={true}
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

        {/* Right Pane: Main Content */}
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          
          {/* Top Header Row */}
          <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3 h-[60px]">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-8 text-[13px] font-medium border-zinc-300 text-zinc-700">
                  <Filter className="size-3.5 mr-1" />
                  Filter
                </Button>
                <div className="h-4 w-px bg-zinc-300 mx-1"></div>
                <Button variant="ghost" size="sm" className="h-8 text-[13px] font-medium text-zinc-700">
                  All Contacts <ChevronDown className="size-3.5 ml-1" />
                </Button>
              </div>
            </div>
            <Button onClick={() => setShowForm((value) => !value)} size="sm" className="h-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded shadow-sm text-[13px] px-4 font-medium">
              {showForm ? "Cancel" : "Create Contact"}
            </Button>
          </div>

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
                  {saving ? "Saving..." : "Save Contact"}
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
            ) : customers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="rounded-full bg-zinc-50 p-4 mb-3 border border-zinc-100">
                  <Search className="size-6 text-zinc-300" />
                </div>
                <h3 className="text-[15px] font-semibold text-zinc-900">No contacts found</h3>
                <p className="text-[13px] text-zinc-500 mt-1 max-w-sm">You haven't created any contacts yet. Click the "Create Contact" button to add your first record.</p>
              </div>
            ) : (
              <table className="w-full text-left text-[13px] whitespace-nowrap">
                <thead className="bg-[#f8f9fa] text-zinc-700 font-semibold sticky top-0 border-b border-zinc-200 shadow-sm z-10">
                  <tr>
                    <th className="px-4 py-2.5 w-10 text-center">
                      <input type="checkbox" className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-600 size-3.5" />
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
                  {customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-[#f8f9fa] transition-colors group cursor-pointer">
                      <td className="px-4 py-2.5 text-center">
                        <input type="checkbox" className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-600 size-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
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
                          onClick={(e) => {
                            e.preventDefault();
                            handleDelete(customer.id);
                          }}
                          className="text-zinc-400 hover:text-red-600 p-1 rounded hover:bg-red-50"
                          aria-label="Delete contact"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          
          {/* Pagination Footer */}
          {customers.length > 0 && (
            <div className="flex items-center justify-between border-t border-zinc-200 bg-white px-4 py-2.5 text-xs text-zinc-500">
              <div className="flex items-center gap-4">
                <span>Total Records: {customers.length}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="cursor-not-allowed text-zinc-300">{'<'}</span>
                <span className="font-medium text-zinc-700">1 to {customers.length}</span>
                <span className="cursor-not-allowed text-zinc-300">{'>'}</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </DashboardShell>
  );
}
