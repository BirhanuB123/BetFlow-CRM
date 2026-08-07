# 🏢 BetFlow Real Estate CRM

BetFlow CRM is a modern, high-performance Customer Relationship Management (CRM) platform specifically designed for enterprise real estate developers and sales agencies. Built with a monorepo architecture, it provides end-to-end lead management, automated SMS drip campaigns (Ethio Telecom & AfroMessage), unit inventory tracking, reservation workflows, PDF proposal/contract generation, digital client signature pads with audit logs, and customizable payment schedules.

---

## 🏗️ Monorepo Architecture

Managed via **Turborepo**:

```text
BetFlow-CRM/
├── apps/
│   ├── api/        # NestJS REST API, Prisma ORM (PostgreSQL), PDFKit, BullMQ & WebSockets
│   └── web/        # Next.js 16 Web Application (React 19, Tailwind CSS v4, Glassmorphism UI)
├── packages/
│   ├── config/     # Monorepo ESLint & TypeScript shared configurations
│   └── shared/     # Shared DTOs, interfaces, roles, and domain constants
├── docs/           # System architectural sequence diagrams
├── docker-compose.yml # PostgreSQL & Redis local infrastructure services
├── .env.example    # Root environment setup template
└── turbo.json      # Turborepo task pipeline execution graph
```

---

## 🚀 Technology Stack

### **Backend (`apps/api`)**
- **Framework**: [NestJS](https://nestjs.com/) (v11)
- **Database & ORM**: PostgreSQL 15 via [Prisma](https://www.prisma.io/) (with `@prisma/adapter-pg`)
- **Document Engine**: PDFKit (automated branded proposal & contract agreement rendering)
- **Background Queues**: BullMQ with Redis
- **Real-Time Communication**: Socket.IO / WebSockets
- **Interactive OpenAPI/Swagger**: Listed at `http://localhost:4000/api/docs`

### **Frontend (`apps/web`)**
- **Framework**: [Next.js](https://nextjs.org/) (v16 App Router)
- **UI Library & Engine**: React 19, Tailwind CSS v4
- **Digital Signatures**: Canvas HTML5 Digital Signature Pad with SHA-256 audit log tracking
- **Theme System**: Unified `#233b66` Corporate Brand Palette

---

## 🛠️ Quick Local Setup

### Prerequisites
- **Node.js**: v20+ or v22+
- **npm**: v10+ or v11+
- **Docker Desktop** (or local PostgreSQL 15+ and Redis instances)

### Step-by-Step Installation

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
   Copy `.env.example` to `.env` in root, `apps/api/.env`, and `apps/web/.env.local`:
   ```bash
   cp .env.example .env
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env.local
   ```

4. **Launch Local Services (PostgreSQL & Redis)**
   ```bash
   docker-compose up -d
   ```

5. **Initialize Database Schema & Sample Data**
   ```bash
   cd apps/api
   npx prisma db push
   npx prisma generate
   npm run seed
   cd ../..
   ```

6. **Start Concurrent Development Servers**
   ```bash
   npm run dev
   ```
   - **Frontend App**: [http://localhost:3000](http://localhost:3000) (or `http://localhost:3001`)
   - **Backend API**: [http://localhost:4000/api](http://localhost:4000/api)
   - **Interactive Swagger Docs**: [http://localhost:4000/api/docs](http://localhost:4000/api/docs)

---

## 📖 API Documentation & Swagger Endpoint

NestJS OpenAPI Swagger documentation is embedded and enabled. Once the backend server is running (`npm run dev` or `npm run start:prod`), navigate to:

👉 **[http://localhost:4000/api/docs](http://localhost:4000/api/docs)**

### Key API Modules Covered:
- `POST /api/auth/login` – User JWT Authentication
- `GET /api/leads` & `POST /api/leads` – CRM Lead Management & Meta Webhook Ingestion
- `GET /api/properties` & `GET /api/units` – Unit Inventory & Price Calculations
- `POST /api/reservations` – 14-Day Property Reservation Holds & Expiry Cron
- `POST /api/contracts/generate-pdf` – Automated Contract & Proposal PDF Rendering
- `POST /api/contracts/:id/sign` – Digital E-Signatures & Timestamped Audit Logs
- `POST /api/integrations/sms/send` – Ethio Telecom & AfroMessage SMS Gateway Dispatch

---

## 🌐 Production Deployment Guide

### Option 1: Docker Container Deployment

1. **Build Docker Production Images**
   ```bash
   docker build -f apps/api/Dockerfile -t betflow-api:latest .
   docker build -f apps/web/Dockerfile -t betflow-web:latest .
   ```

2. **Run Containers with Environment File**
   ```bash
   docker run -d --name betflow-api -p 4000:4000 --env-file .env betflow-api:latest
   docker run -d --name betflow-web -p 3000:3000 --env-file .env betflow-web:latest
   ```

---

### Option 2: Vercel (Frontend) + Render / DigitalOcean (Backend)

#### **Deploying `apps/web` on Vercel**
1. Connect your GitHub repository to [Vercel](https://vercel.com).
2. Set **Root Directory** to `apps/web`.
3. Set **Framework Preset** to Next.js.
4. Add Environment Variables:
   - `NEXT_PUBLIC_API_URL`: `https://your-api-domain.com/api`
   - `NEXT_PUBLIC_APP_URL`: `https://your-vercel-domain.vercel.app`
5. Click **Deploy**.

#### **Deploying `apps/api` on Render or DigitalOcean App Platform**
1. Create a **Node.js Web Service** connecting the GitHub repository.
2. Set **Root Directory** to `apps/api`.
3. Set **Build Command**:
   ```bash
   npm install && npx prisma generate && npm run build
   ```
4. Set **Start Command**:
   ```bash
   npm run start:prod
   ```
5. Add Environment Variables in Dashboard:
   - `DATABASE_URL`: Managed PostgreSQL connection string.
   - `JWT_SECRET`: High-entropy 64+ character random string.
   - `NODE_ENV`: `production`
   - `PORT`: `4000`

---

## 📜 Monorepo NPM Scripts

Run from repository root:

- `npm run dev` – Concurrent hot-reloading development server
- `npm run build` – Full monorepo production build (`@betflow/shared`, `api`, `web`)
- `npm run lint` – Run ESLint across all apps and packages
- `npm run format` – Format repository using Prettier

---

## 🛡️ License

UNLICENSED — Private Enterprise Software. Developed by Gebeta Trading Technology for BetFlow Real Estate CRM.
