# BetFlow CRM

BetFlow CRM is a modern, high-performance Customer Relationship Management (CRM) platform built with a monorepo architecture. It provides real-time lead management, automated marketing campaigns (SMS & Email), real-estate reservation tracking, deal management, and role-based access control.

---

## 🏗️ Repository Architecture

This project is managed as a **Turborepo** monorepo:

```text
BetFlow-CRM/
├── apps/
│   ├── api/        # Backend API built with NestJS, Prisma ORM, BullMQ & WebSockets
│   └── web/        # Frontend Web Application built with Next.js 16 (React 19 & Tailwind CSS v4)
├── packages/
│   ├── config/     # Shared TypeScript and tooling configurations
│   └── shared/     # Shared DTOs, interfaces, constants, and utility types
├── docs/           # Architecture & sequence diagrams
├── docker-compose.yml # PostgreSQL & Redis local infrastructure
└── turbo.json      # Turborepo task pipeline configuration
```

---

## 🚀 Tech Stack

### **Backend (`apps/api`)**
- **Framework**: [NestJS](https://nestjs.com/) (v11)
- **Database ORM**: [Prisma](https://www.prisma.io/) (PostgreSQL 15)
- **Background Jobs**: [BullMQ](https://bullmq.io/) with Redis
- **Real-Time Communication**: [Socket.IO](https://socket.io/) / WebSockets
- **API Documentation**: Swagger / OpenAPI (`/api/docs`)

### **Frontend (`apps/web`)**
- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Library**: React 19
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/), Lucide Icons
- **Components**: Shadcn UI / Base UI

### **Infrastructure & Tools**
- **Monorepo Manager**: [Turborepo](https://turbo.build/)
- **Containerization**: Docker & Docker Compose
- **Language**: TypeScript 5.7+

---

## 🛠️ Getting Started

### Prerequisites

Make sure you have the following installed on your system:
- **Node.js** (v20+ recommended)
- **npm** (v10+ or v11+)
- **Docker & Docker Compose** (for PostgreSQL and Redis)

---

### Installation & Local Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/BirhanuB123/BetFlow-CRM.git
   cd BetFlow-CRM
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

4. **Start Database & Cache Services (Docker)**
   Start local PostgreSQL and Redis containers:
   ```bash
   docker-compose up -d
   ```

5. **Run Database Migrations & Seeds**
   ```bash
   cd apps/api
   npx prisma migrate dev
   npm run seed
   cd ../..
   ```

6. **Start Development Mode**
   From the root directory, launch all applications concurrently via Turborepo:
   ```bash
   npm run dev
   ```

   - **Frontend App**: [http://localhost:3001](http://localhost:3001)
   - **Backend API**: [http://localhost:4000](http://localhost:4000)
   - **Swagger API Docs**: [http://localhost:4000/api/docs](http://localhost:4000/api/docs)

---

## 📜 Available Scripts

Run scripts from the repository root:

- `npm run dev` – Launch NestJS backend and Next.js frontend in watch mode
- `npm run build` – Build all applications and packages for production
- `npm run lint` – Run ESLint across the monorepo
- `npm run format` – Format files using Prettier

---

## 📄 Documentation

Architectural docs and sequence diagrams can be found in the [`/docs`](./docs) directory:
- [Sequence Diagrams](./docs/sequence-diagrams.md)

---

## 🛡️ License

UNLICENSED - Private Project.
