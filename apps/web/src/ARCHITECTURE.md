# BetFlow CRM Frontend Architecture Guidelines (`apps/web/src`)

This document defines the standard directory boundaries and layering conventions for the Next.js frontend app.

---

## 📁 Directory Structure & Layer Responsibilities

```text
apps/web/src/
├── app/                  # Next.js App Router pages, layouts, and route handlers.
├── components/           # Generic & shared UI components.
│   ├── layout/           # Global shell layouts (DashboardShell, Sidebar, TopNav).
│   ├── tables/           # Shared table rendering primitives (CrmTable).
│   └── ui/               # Pure, domain-agnostic UI primitives (Button, Input, Modal, Toast, Skeleton, EmptyState).
├── features/             # Domain-specific features, sub-views, components, and helper logic.
│   ├── activity/         # Activity timelines & audit logs.
│   ├── auth/             # Login, signup, MFA, and auth providers.
│   ├── contracts/        # Contract templates, builder, e-signatures, and signature modal.
│   ├── deals/            # Deal pipeline Kanban views & stage progression.
│   ├── documents/        # Document panels, file previewers & uploaders.
│   ├── enterprise/       # Account details & corporate customer management.
│   ├── go-to-market/     # Email & SMS drip campaign views.
│   ├── leads/            # Lead generation tables, status filters & forms.
│   ├── notes/            # Notes panel & record commentary.
│   ├── notifications/    # Follow-up & overdue payment alerts.
│   ├── payments/         # Milestone payment schedules & receipt logging.
│   ├── properties/       # Construction stage milestone trackers & unit stacking plan.
│   ├── reports/          # Revenue analytics, sales forecasting & charts.
│   └── settings/         # Tenant settings, audit logs & domain configuration.
├── hooks/                # Reusable, cross-feature React hooks (e.g. useDebounce).
├── lib/                  # Low-level utilities, formatting helpers & i18n dictionaries.
└── services/             # Centralized API HTTP client service wrappers (api.ts).
```

---

## 📐 Layer Rules & Placement Guidelines

1. **Pure UI Primitives (`src/components/ui/`)**:
   - MUST be domain-agnostic and reusable anywhere.
   - Examples: `Button`, `Input`, `Badge`, `Toast`, `EmptyState`, `SkeletonLoaders`.
   - MUST NOT contain business logic or direct API queries.

2. **Domain Features (`src/features/[domain]/`)**:
   - MUST encapsulate domain-specific components, modals, and business sub-views.
   - Examples: `features/contracts/signature-modal.tsx`, `features/documents/documents-panel.tsx`.
   - Pages in `src/app/` SHOULD assemble feature components from `src/features/[domain]`.

3. **HTTP API Services (`src/services/`)**:
   - MUST serve as the unified API interaction layer (`services/api.ts`).
   - All network calls from page components or features SHOULD use imports from `@/services/api`.
