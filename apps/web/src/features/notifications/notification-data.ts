export type NotificationChannel = "SMS" | "Telegram" | "Email";
export type NotificationStatus = "Queued" | "Sent" | "Failed" | "Scheduled";
export type AlertPriority = "High" | "Medium" | "Low";

export type NotificationMessage = {
  id: string;
  channel: NotificationChannel;
  recipient: string;
  subject: string;
  relatedTo: string;
  scheduledFor: string;
  status: NotificationStatus;
};

export type OverduePaymentAlert = {
  id: string;
  customer: string;
  reservation: string;
  amount: string;
  overdueBy: string;
  owner: string;
  priority: AlertPriority;
};

export type FollowUpReminder = {
  id: string;
  lead: string;
  owner: string;
  due: string;
  reason: string;
  channel: NotificationChannel;
  priority: AlertPriority;
};

export const notificationMessages: NotificationMessage[] = [
  {
    id: "notification_001",
    channel: "SMS",
    recipient: "Ari Kaplan",
    subject: "Site visit reminder for A-1802",
    relatedTo: "visit_001",
    scheduledFor: "Today, 1:30 PM",
    status: "Scheduled",
  },
  {
    id: "notification_002",
    channel: "Telegram",
    recipient: "Omar Haddad",
    subject: "Kaplan deposit approved",
    relatedTo: "payment_001",
    scheduledFor: "Sent 22 min ago",
    status: "Sent",
  },
  {
    id: "notification_003",
    channel: "Email",
    recipient: "Bell Family Office",
    subject: "Reservation deposit reminder",
    relatedTo: "reservation_001",
    scheduledFor: "Today, 4:00 PM",
    status: "Queued",
  },
  {
    id: "notification_004",
    channel: "SMS",
    recipient: "Priya Shah",
    subject: "Tour confirmation for N-0905",
    relatedTo: "visit_002",
    scheduledFor: "Tomorrow, 9:00 AM",
    status: "Scheduled",
  },
];

export const overduePaymentAlerts: OverduePaymentAlert[] = [
  {
    id: "overdue_001",
    customer: "Bell Family Office",
    reservation: "reservation_001",
    amount: "$25,000",
    overdueBy: "1 day",
    owner: "Maya Johnson",
    priority: "High",
  },
  {
    id: "overdue_002",
    customer: "Northline Capital",
    reservation: "reservation_003",
    amount: "$28,000",
    overdueBy: "Due today",
    owner: "Noah Smith",
    priority: "Medium",
  },
];

export const followUpReminders: FollowUpReminder[] = [
  {
    id: "followup_001",
    lead: "Elena Torres",
    owner: "Noah Smith",
    due: "Today, 3:00 PM",
    reason: "New lead has not been contacted",
    channel: "SMS",
    priority: "Medium",
  },
  {
    id: "followup_002",
    lead: "Marcus Bell",
    owner: "Maya Johnson",
    due: "Tomorrow, 10:00 AM",
    reason: "Proposal follow-up after legal review",
    channel: "Email",
    priority: "High",
  },
  {
    id: "followup_003",
    lead: "Priya Shah",
    owner: "Noah Smith",
    due: "Tomorrow, 1:00 PM",
    reason: "Confirm attendees before site visit",
    channel: "Telegram",
    priority: "Low",
  },
];

export const notificationMetrics = [
  { label: "SMS reminders", value: "2", detail: "Both scheduled" },
  { label: "Telegram", value: "2", detail: "1 sent, 1 scheduled" },
  { label: "Email alerts", value: "2", detail: "Payment and follow-up" },
  { label: "Overdue alerts", value: "2", detail: "1 high priority" },
];

export const notificationStatusClass: Record<NotificationStatus, string> = {
  Queued: "bg-blue-50 text-blue-700",
  Sent: "bg-emerald-50 text-emerald-700",
  Failed: "bg-red-50 text-red-700",
  Scheduled: "bg-amber-50 text-amber-800",
};

export const priorityClass: Record<AlertPriority, string> = {
  High: "bg-red-50 text-red-700",
  Medium: "bg-amber-50 text-amber-800",
  Low: "bg-zinc-100 text-zinc-700",
};
