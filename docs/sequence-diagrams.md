# BetFlow CRM — Sequence Diagrams

Multi-tenant real-estate CRM. Frontend: **Next.js** (`apps/web`). API: **NestJS** (`apps/api`,
served under `/api`). Data: **PostgreSQL via Prisma**. Auth: custom HMAC **JWT**.

**Common pattern:** the browser calls the API through `apiFetch` (`apps/web/src/lib/api.ts`),
which attaches `Authorization: Bearer <jwt>`. The API's `JwtAuthGuard` verifies the token and
exposes `request.user = {id, tenantId, roles}` (via the `@CurrentUser()` decorator). Controllers
delegate to services; every query is **scoped by `tenantId`**, and mutations write an `AuditLog`
row, which the **activity timeline** reads back (humanized).

## Legend

| Participant | Maps to |
|---|---|
| Web | `apps/web` client component + `apiFetch` |
| Guard | `common/guards/jwt-auth.guard.ts` + `auth/jwt.service.ts` |
| Controller / Service | `apps/api/src/<module>/*.controller.ts` / `*.service.ts` |
| DB | PostgreSQL through `PrismaService` |

---

## 1. Authentication (login)

```mermaid
sequenceDiagram
    actor User
    participant Web as Next.js · auth page
    participant API as NestJS · /api
    participant Auth as AuthService
    participant DB as PostgreSQL (Prisma)

    User->>Web: email, workspace slug, password
    Web->>API: POST /api/auth/login
    API->>Auth: login({email, tenantSlug, password})
    Auth->>DB: tenant.findUnique(domain = slug)
    DB-->>Auth: tenant
    Auth->>DB: user.findFirst(tenantId, email, isActive) + roles
    DB-->>Auth: user
    Auth->>Auth: passwords.verify(password, hash)
    alt invalid credentials
        Auth-->>Web: 401 Unauthorized
        Web-->>User: "Unable to sign in"
    else valid
        Auth->>DB: auditLog.create(auth.login)
        Auth->>Auth: jwt.sign({sub, tenantId, email, roles})
        Auth-->>Web: 201 {accessToken, user, tenant}
        Web->>Web: persistSession (local/sessionStorage per "Remember me")
        Web-->>User: redirect /dashboard
    end
```

## 2. Authenticated request pattern (tenant-scoped) + 401 handling

```mermaid
sequenceDiagram
    actor User
    participant Web as Next.js · apiFetch
    participant Guard as JwtAuthGuard
    participant Ctrl as Controller
    participant Svc as Service
    participant DB as PostgreSQL

    User->>Web: open /accounts
    Web->>Guard: GET /api/accounts (Bearer JWT)
    Guard->>Guard: jwt.verify(token)
    alt token missing / expired
        Guard-->>Web: 401
        Web->>Web: clearSession()
        Web-->>User: redirect /auth
    else valid
        Guard->>Ctrl: request.user = {id, tenantId, roles}
        Ctrl->>Svc: list(user.tenantId)
        Svc->>DB: account.findMany(where tenantId)
        DB-->>Svc: rows (scoped to tenant)
        Svc-->>Ctrl: accounts
        Ctrl-->>Web: 200 [accounts]
        Web-->>User: render
    end
```

## 3. Create record → audit → activity timeline

```mermaid
sequenceDiagram
    actor User
    participant Web as Customer 360 page
    participant Ctrl as NotesController
    participant Svc as NotesService
    participant DB as PostgreSQL
    participant TL as ActivityTimeline

    User->>Web: add a note
    Web->>Ctrl: POST /api/notes {content, entityType, entityId}
    Ctrl->>Svc: create(tenantId, userId, input)
    Svc->>DB: note.create(...)
    Svc->>DB: auditLog.create(note.created, {preview})
    Svc-->>Web: 201 note
    Web->>TL: refresh (key bump)
    TL->>Ctrl: GET /api/activities?entityType&entityId
    Ctrl->>DB: auditLog.findMany → humanize labels
    DB-->>TL: "Note added" + preview
    TL-->>User: timeline updates
```

## 4. Real-estate inventory state machine (reserve → sign)

```mermaid
sequenceDiagram
    actor Agent
    participant Web
    participant RSvc as ReservationsService
    participant CSvc as ContractsService
    participant DB as PostgreSQL (transaction)

    Agent->>Web: reserve unit for customer
    Web->>RSvc: POST /api/reservations {customerId, unitId, amount}
    RSvc->>DB: BEGIN tx
    RSvc->>DB: unit.findFirst(id, tenantId)
    alt unit not AVAILABLE
        RSvc-->>Web: 400 "unit is reserved/sold" (double-booking blocked)
    else AVAILABLE
        RSvc->>DB: reservation.create(status PENDING)
        RSvc->>DB: unit.update(status -> RESERVED)
        RSvc->>DB: auditLog.create(reservation.created)
        RSvc->>DB: COMMIT
        RSvc-->>Web: 201 reservation (unit RESERVED)
    end

    Agent->>Web: mark contract SIGNED
    Web->>CSvc: PATCH /api/contracts/:id {status: SIGNED}
    CSvc->>DB: BEGIN tx
    CSvc->>DB: contract.update(status -> SIGNED)
    CSvc->>DB: unit.update(status -> SOLD)
    CSvc->>DB: auditLog.create(contract.signed)
    CSvc->>DB: COMMIT
    CSvc-->>Web: 200 contract (unit SOLD)
```

## 5. Tenant registration (sign-up)

```mermaid
sequenceDiagram
    actor Owner
    participant Web as Next.js · auth (register)
    participant TSvc as TenantsService
    participant DB as PostgreSQL (transaction)

    Owner->>Web: company, slug, owner name/email, password
    Web->>TSvc: POST /api/auth/register
    TSvc->>DB: BEGIN tx
    TSvc->>DB: tenant.create(name, domain = slug)
    TSvc->>DB: role.create(Owner)
    TSvc->>DB: user.create(owner) + userRole
    TSvc->>DB: subscription.create(plan)
    TSvc->>DB: auditLog.create(tenant.registered)
    TSvc->>DB: COMMIT
    TSvc-->>Web: 201 {tenant, owner}
    Web->>Web: auto-login -> POST /api/auth/login
    Web-->>Owner: redirect /dashboard
```
