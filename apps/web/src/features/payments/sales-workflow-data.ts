export type SiteVisitStatus = "Scheduled" | "Completed" | "No show";
export type ReservationStatus =
  "Draft" | "Pending payment" | "Reserved" | "Expired";
export type PaymentStatus = "Pending" | "Paid" | "Overdue" | "Partially paid";
export type ReceiptStatus =
  "Uploaded" | "Under review" | "Approved" | "Rejected";
export type ApprovalStatus = "Waiting" | "Approved" | "Needs revision";

export type SiteVisit = {
  id: string;
  lead: string;
  unit: string;
  agent: string;
  scheduledFor: string;
  status: SiteVisitStatus;
  outcome: string;
};

export type Reservation = {
  id: string;
  customer: string;
  unit: string;
  expiresAt: string;
  deposit: string;
  status: ReservationStatus;
  owner: string;
};

export type PaymentScheduleItem = {
  id: string;
  reservation: string;
  milestone: string;
  dueDate: string;
  amount: string;
  status: PaymentStatus;
};

export type PaymentTransaction = {
  id: string;
  customer: string;
  method: "Bank transfer" | "Card" | "Check";
  amount: string;
  receivedAt: string;
  status: PaymentStatus;
};

export type Receipt = {
  id: string;
  payment: string;
  fileName: string;
  uploadedBy: string;
  uploadedAt: string;
  status: ReceiptStatus;
};

export type FinanceApproval = {
  id: string;
  reservation: string;
  reviewer: string;
  amount: string;
  submittedAt: string;
  status: ApprovalStatus;
  note: string;
};

export const siteVisits: SiteVisit[] = [
  {
    id: "visit_001",
    lead: "Ari Kaplan",
    unit: "A-1802",
    agent: "Omar Haddad",
    scheduledFor: "Today, 2:30 PM",
    status: "Scheduled",
    outcome: "Awaiting visit",
  },
  {
    id: "visit_002",
    lead: "Priya Shah",
    unit: "N-0905",
    agent: "Noah Smith",
    scheduledFor: "Tomorrow, 11:00 AM",
    status: "Scheduled",
    outcome: "Confirmed by email",
  },
  {
    id: "visit_003",
    lead: "Marcus Bell",
    unit: "A-1803",
    agent: "Maya Johnson",
    scheduledFor: "Yesterday, 4:00 PM",
    status: "Completed",
    outcome: "Requested reservation draft",
  },
];

export const reservations: Reservation[] = [
  {
    id: "reservation_001",
    customer: "Bell Family Office",
    unit: "A-1803",
    expiresAt: "Jul 5, 2026",
    deposit: "$50,000",
    status: "Pending payment",
    owner: "Maya Johnson",
  },
  {
    id: "reservation_002",
    customer: "Kaplan Holdings",
    unit: "A-1802",
    expiresAt: "Jul 8, 2026",
    deposit: "$35,000",
    status: "Reserved",
    owner: "Omar Haddad",
  },
  {
    id: "reservation_003",
    customer: "Northline Capital",
    unit: "N-0905",
    expiresAt: "Jul 12, 2026",
    deposit: "$28,000",
    status: "Draft",
    owner: "Birhanu Getu",
  },
];

export const paymentSchedule: PaymentScheduleItem[] = [
  {
    id: "schedule_001",
    reservation: "reservation_001",
    milestone: "Reservation deposit",
    dueDate: "Jul 5, 2026",
    amount: "$50,000",
    status: "Pending",
  },
  {
    id: "schedule_002",
    reservation: "reservation_002",
    milestone: "Reservation deposit",
    dueDate: "Jun 30, 2026",
    amount: "$35,000",
    status: "Paid",
  },
  {
    id: "schedule_003",
    reservation: "reservation_002",
    milestone: "Contract signing",
    dueDate: "Jul 20, 2026",
    amount: "$145,000",
    status: "Pending",
  },
  {
    id: "schedule_004",
    reservation: "reservation_003",
    milestone: "Reservation deposit",
    dueDate: "Jul 12, 2026",
    amount: "ETB 28,000",
    status: "Pending",
  },
];

export const paymentTransactions: PaymentTransaction[] = [
  {
    id: "payment_001",
    customer: "Kaplan Holdings",
    method: "Bank transfer",
    amount: "$35,000",
    receivedAt: "Today, 9:15 AM",
    status: "Paid",
  },
  {
    id: "payment_002",
    customer: "Bell Family Office",
    method: "Check",
    amount: "$25,000",
    receivedAt: "Pending",
    status: "Partially paid",
  },
];

export const receipts: Receipt[] = [
  {
    id: "receipt_001",
    payment: "payment_001",
    fileName: "kaplan-deposit-wire.pdf",
    uploadedBy: "Omar Haddad",
    uploadedAt: "Today, 9:18 AM",
    status: "Approved",
  },
  {
    id: "receipt_002",
    payment: "payment_002",
    fileName: "bell-check-scan.jpg",
    uploadedBy: "Maya Johnson",
    uploadedAt: "Today, 10:02 AM",
    status: "Under review",
  },
];

export const financeApprovals: FinanceApproval[] = [
  {
    id: "approval_001",
    reservation: "reservation_001",
    reviewer: "Lina Park",
    amount: "$25,000",
    submittedAt: "Today, 10:04 AM",
    status: "Waiting",
    note: "Partial deposit requires finance confirmation.",
  },
  {
    id: "approval_002",
    reservation: "reservation_002",
    reviewer: "Lina Park",
    amount: "$35,000",
    submittedAt: "Today, 9:22 AM",
    status: "Approved",
    note: "Wire receipt matched bank ledger.",
  },
];

export const workflowMetrics = [
  { label: "Site visits", value: "3", detail: "2 scheduled, 1 completed" },
  { label: "Reservations", value: "3", detail: "1 confirmed, 2 in progress" },
  { label: "Payments tracked", value: "$60K", detail: "$35K approved" },
  { label: "Finance queue", value: "1", detail: "Awaiting approval" },
];

export const paymentStatusClass: Record<PaymentStatus, string> = {
  Pending: "bg-amber-50 text-amber-800",
  Paid: "bg-emerald-50 text-emerald-700",
  Overdue: "bg-red-50 text-red-700",
  "Partially paid": "bg-blue-50 text-blue-700",
};

export const reservationStatusClass: Record<ReservationStatus, string> = {
  Draft: "bg-zinc-100 text-zinc-700",
  "Pending payment": "bg-amber-50 text-amber-800",
  Reserved: "bg-emerald-50 text-emerald-700",
  Expired: "bg-red-50 text-red-700",
};

export const receiptStatusClass: Record<ReceiptStatus, string> = {
  Uploaded: "bg-blue-50 text-blue-700",
  "Under review": "bg-amber-50 text-amber-800",
  Approved: "bg-emerald-50 text-emerald-700",
  Rejected: "bg-red-50 text-red-700",
};

export const approvalStatusClass: Record<ApprovalStatus, string> = {
  Waiting: "bg-amber-50 text-amber-800",
  Approved: "bg-emerald-50 text-emerald-700",
  "Needs revision": "bg-red-50 text-red-700",
};
