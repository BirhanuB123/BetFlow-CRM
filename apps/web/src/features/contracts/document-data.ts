export type UploadedDocument = {
  id: string;
  name: string;
  category: "KYC" | "Proof of payment" | "Reservation" | "Contract";
  relatedTo: string;
  uploadedBy: string;
  uploadedAt: string;
  status: "Uploaded" | "Verified" | "Rejected";
};

export type ContractTemplate = {
  id: string;
  name: string;
  type: "Reservation" | "Sale agreement" | "Addendum";
  version: string;
  lastUpdated: string;
  status: "Active" | "Draft";
};

export type GeneratedPdf = {
  id: string;
  contract: string;
  customer: string;
  unit: string;
  generatedAt: string;
  status: "Generated" | "Sent" | "Regenerating";
};

export type LegalApproval = {
  id: string;
  contract: string;
  reviewer: string;
  submittedAt: string;
  status: "Waiting" | "Approved" | "Needs changes";
  note: string;
};

export type SignedContract = {
  id: string;
  contract: string;
  customer: string;
  signedAt: string;
  storage: string;
  status: "Stored" | "Pending countersign" | "Archived";
};

export const uploadedDocuments: UploadedDocument[] = [
  {
    id: "doc_001",
    name: "kaplan-passport.pdf",
    category: "KYC",
    relatedTo: "Kaplan Holdings",
    uploadedBy: "Omar Haddad",
    uploadedAt: "Today, 11:12 AM",
    status: "Verified",
  },
  {
    id: "doc_002",
    name: "bell-reservation-form.pdf",
    category: "Reservation",
    relatedTo: "Bell Family Office",
    uploadedBy: "Maya Johnson",
    uploadedAt: "Today, 10:28 AM",
    status: "Uploaded",
  },
  {
    id: "doc_003",
    name: "kaplan-wire-receipt.pdf",
    category: "Proof of payment",
    relatedTo: "Kaplan Holdings",
    uploadedBy: "Omar Haddad",
    uploadedAt: "Yesterday",
    status: "Verified",
  },
];

export const contractTemplates: ContractTemplate[] = [
  {
    id: "template_001",
    name: "Standard reservation agreement",
    type: "Reservation",
    version: "v2.4",
    lastUpdated: "Jun 27, 2026",
    status: "Active",
  },
  {
    id: "template_002",
    name: "Residential sale agreement",
    type: "Sale agreement",
    version: "v1.9",
    lastUpdated: "Jun 22, 2026",
    status: "Active",
  },
  {
    id: "template_003",
    name: "Payment plan addendum",
    type: "Addendum",
    version: "v0.8",
    lastUpdated: "Jun 18, 2026",
    status: "Draft",
  },
];

export const generatedPdfs: GeneratedPdf[] = [
  {
    id: "pdf_001",
    contract: "Standard reservation agreement",
    customer: "Bell Family Office",
    unit: "A-1803",
    generatedAt: "Today, 11:05 AM",
    status: "Sent",
  },
  {
    id: "pdf_002",
    contract: "Residential sale agreement",
    customer: "Kaplan Holdings",
    unit: "A-1802",
    generatedAt: "Today, 9:44 AM",
    status: "Generated",
  },
];

export const legalApprovals: LegalApproval[] = [
  {
    id: "legal_001",
    contract: "Bell reservation agreement",
    reviewer: "Legal Team",
    submittedAt: "Today, 11:08 AM",
    status: "Waiting",
    note: "Deposit clause requires confirmation.",
  },
  {
    id: "legal_002",
    contract: "Kaplan sale agreement",
    reviewer: "Legal Team",
    submittedAt: "Yesterday",
    status: "Approved",
    note: "Approved for signature.",
  },
];

export const signedContracts: SignedContract[] = [
  {
    id: "signed_001",
    contract: "Kaplan sale agreement",
    customer: "Kaplan Holdings",
    signedAt: "Today, 12:14 PM",
    storage: "contracts/2026/kaplan-sale-agreement.pdf",
    status: "Stored",
  },
  {
    id: "signed_002",
    contract: "Bell reservation agreement",
    customer: "Bell Family Office",
    signedAt: "Pending",
    storage: "contracts/pending/bell-reservation-agreement.pdf",
    status: "Pending countersign",
  },
];

export const documentMetrics = [
  { label: "Uploads", value: "3", detail: "2 verified, 1 pending" },
  { label: "Templates", value: "3", detail: "2 active templates" },
  { label: "Generated PDFs", value: "2", detail: "1 sent for review" },
  { label: "Legal queue", value: "1", detail: "Awaiting legal approval" },
];

export const documentStatusClass = {
  Uploaded: "bg-blue-50 text-blue-700",
  Verified: "bg-emerald-50 text-emerald-700",
  Rejected: "bg-red-50 text-red-700",
};

export const contractStatusClass = {
  Active: "bg-emerald-50 text-emerald-700",
  Draft: "bg-zinc-100 text-zinc-700",
  Generated: "bg-blue-50 text-blue-700",
  Sent: "bg-violet-50 text-violet-700",
  Regenerating: "bg-amber-50 text-amber-800",
  Waiting: "bg-amber-50 text-amber-800",
  Approved: "bg-emerald-50 text-emerald-700",
  "Needs changes": "bg-red-50 text-red-700",
  Stored: "bg-emerald-50 text-emerald-700",
  "Pending countersign": "bg-amber-50 text-amber-800",
  Archived: "bg-zinc-100 text-zinc-700",
};
