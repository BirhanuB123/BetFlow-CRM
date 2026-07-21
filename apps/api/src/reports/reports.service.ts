import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  // --------------------------------------------------------
  // 1. SALES DASHBOARD
  // Booked Revenue = sum of all Contract totalAmt (ACTIVE/SIGNED)
  // Collected Payments = sum of COMPLETED Payment amounts
  // Active Reservations + Contracts count
  // --------------------------------------------------------
  async salesDashboard() {
    const [contractSum, paymentSum, reservationCount, contractCount, leadCount] =
      await Promise.all([
        this.prisma.contract.aggregate({
          _sum: { totalAmt: true },
          where: { status: { in: ['ACTIVE', 'SIGNED'] } },
        }),
        this.prisma.payment.aggregate({
          _sum: { amount: true },
          where: { status: 'COMPLETED' },
        }),
        this.prisma.reservation.count({ where: { status: { not: 'CANCELLED' } } }),
        this.prisma.contract.count({ where: { status: { in: ['ACTIVE', 'SIGNED'] } } }),
        this.prisma.lead.count({ where: { status: { not: 'CONVERTED' } } }),
      ]);

    const bookedRevenue = Number(contractSum._sum.totalAmt ?? 0);
    const collectedPayments = Number(paymentSum._sum.amount ?? 0);
    const outstanding = bookedRevenue - collectedPayments;

    return {
      bookedRevenue,
      collectedPayments,
      outstanding,
      activeReservations: reservationCount,
      activeContracts: contractCount,
      openLeads: leadCount,
      metrics: [
        { label: 'Booked revenue', value: this.formatCurrency(bookedRevenue), detail: 'Active contracts' },
        { label: 'Collected', value: this.formatCurrency(collectedPayments), detail: 'Completed payments' },
        { label: 'Outstanding', value: this.formatCurrency(outstanding), detail: 'Pending collections' },
        { label: 'Open leads', value: String(leadCount), detail: 'Awaiting conversion' },
      ],
    };
  }

  // --------------------------------------------------------
  // 2. AGENT PERFORMANCE
  // Group leads, site visits, and converted contracts by owner
  // --------------------------------------------------------
  async agentPerformance() {
    // All queries in parallel
    const [leadsByOwner, visitsByOwner, contractsWithOwner] = await Promise.all([
      // Leads grouped by ownerId
      this.prisma.lead.groupBy({
        by: ['ownerId'],
        _count: { id: true },
        where: { ownerId: { not: null } },
      }),
      // SiteVisits linked to a lead's owner
      this.prisma.siteVisit.findMany({
        where: { leadId: { not: null } },
        select: { lead: { select: { ownerId: true } } },
      }),
      // Contracts with their deal → account → ownerId chain for revenue attribution
      this.prisma.contract.findMany({
        where: { deal: { is: { accountId: { not: null } } } },
        select: {
          totalAmt: true,
          deal: {
            select: {
              account: { select: { ownerId: true } },
            },
          },
        },
      }),
    ]);

    // Collect all owner IDs
    const allOwnerIds = new Set<string>(leadsByOwner.map((l) => l.ownerId!));
    for (const c of contractsWithOwner) {
      const ownerId = c.deal?.account?.ownerId;
      if (ownerId) allOwnerIds.add(ownerId);
    }

    // Fetch user display names
    const users = await this.prisma.user.findMany({
      where: { id: { in: [...allOwnerIds] } },
      select: { id: true, firstName: true, lastName: true },
    });
    const userMap = new Map(users.map((u) => [u.id, `${u.firstName} ${u.lastName}`.trim()]));

    // Aggregate leads per owner
    const leadMap = new Map<string, number>();
    for (const l of leadsByOwner) {
      if (l.ownerId) leadMap.set(l.ownerId, l._count.id);
    }

    // Aggregate site visits per lead owner
    const visitMap = new Map<string, number>();
    for (const v of visitsByOwner) {
      const ownerId = v.lead?.ownerId;
      if (ownerId) visitMap.set(ownerId, (visitMap.get(ownerId) ?? 0) + 1);
    }

    // Aggregate revenue and conversions per account owner
    const revenueMap = new Map<string, number>();
    const conversionMap = new Map<string, number>();
    for (const c of contractsWithOwner) {
      const ownerId = c.deal?.account?.ownerId;
      if (ownerId) {
        revenueMap.set(ownerId, (revenueMap.get(ownerId) ?? 0) + Number(c.totalAmt));
        conversionMap.set(ownerId, (conversionMap.get(ownerId) ?? 0) + 1);
      }
    }

    const rows = [...allOwnerIds].map((ownerId) => {
      const leads = leadMap.get(ownerId) ?? 0;
      const visits = visitMap.get(ownerId) ?? 0;
      const revenue = revenueMap.get(ownerId) ?? 0;
      const converted = conversionMap.get(ownerId) ?? 0;
      const conversionRate = leads > 0 ? ((converted / leads) * 100).toFixed(1) + '%' : '0%';

      return {
        agentId: ownerId,
        agent: userMap.get(ownerId) ?? 'Unknown',
        leads,
        visits,
        reservations: converted,
        revenue: this.formatCurrency(revenue),
        conversion: conversionRate,
      };
    });

    return rows.sort((a, b) => b.leads - a.leads);
  }

  // --------------------------------------------------------
  // 3. CONVERSION FUNNEL
  // Counts each stage: Leads → SiteVisits → Reservations → Contracts
  // --------------------------------------------------------
  async conversionFunnel() {
    const [leads, siteVisits, reservations, contracts] = await Promise.all([
      this.prisma.lead.count(),
      this.prisma.siteVisit.count(),
      this.prisma.reservation.count({ where: { status: { not: 'CANCELLED' } } }),
      this.prisma.contract.count({ where: { status: { not: 'CANCELLED' } } }),
    ]);

    const stages = [
      { stage: 'Lead Captured', count: leads },
      { stage: 'Site Visit', count: siteVisits },
      { stage: 'Reservation', count: reservations },
      { stage: 'Contract Signed', count: contracts },
    ];

    return stages.map((stage, index) => {
      const prev = index === 0 ? stage.count : stages[index - 1].count;
      const rate = prev > 0 ? ((stage.count / (index === 0 ? 1 : prev)) * 100).toFixed(1) + '%' : '0%';
      const dropOff = index === 0 ? '-' : (prev - stage.count > 0 ? `−${prev - stage.count}` : '0');
      return {
        stage: stage.stage,
        count: stage.count,
        rate,
        dropOff,
      };
    });
  }

  // --------------------------------------------------------
  // 4. PAYMENT AGING
  // Groups PENDING PaymentSchedule entries by dueDate buckets
  // Current (not yet due), 1-15 days, 16-30 days, 31+ days
  // --------------------------------------------------------
  async paymentAging() {
    const now = new Date();

    const pending = await this.prisma.paymentSchedule.findMany({
      where: { status: { not: 'PAID' } },
      select: { dueDate: true, amount: true },
    });

    const buckets = {
      current: { count: 0, total: 0 },
      '1-15': { count: 0, total: 0 },
      '16-30': { count: 0, total: 0 },
      '31+': { count: 0, total: 0 },
    };

    for (const item of pending) {
      const diffMs = now.getTime() - new Date(item.dueDate).getTime();
      const days = Math.floor(diffMs / 86_400_000);
      const amount = Number(item.amount);

      if (days <= 0) {
        buckets.current.count++;
        buckets.current.total += amount;
      } else if (days <= 15) {
        buckets['1-15'].count++;
        buckets['1-15'].total += amount;
      } else if (days <= 30) {
        buckets['16-30'].count++;
        buckets['16-30'].total += amount;
      } else {
        buckets['31+'].count++;
        buckets['31+'].total += amount;
      }
    }

    return [
      { bucket: 'Current (not yet due)', invoices: buckets.current.count, amount: this.formatCurrency(buckets.current.total), risk: 'Low' },
      { bucket: '1–15 days overdue', invoices: buckets['1-15'].count, amount: this.formatCurrency(buckets['1-15'].total), risk: 'Medium' },
      { bucket: '16–30 days overdue', invoices: buckets['16-30'].count, amount: this.formatCurrency(buckets['16-30'].total), risk: 'High' },
      { bucket: '31+ days overdue', invoices: buckets['31+'].count, amount: this.formatCurrency(buckets['31+'].total), risk: 'Critical' },
    ];
  }

  // --------------------------------------------------------
  // 5. REVENUE REPORT (Monthly breakdown)
  // --------------------------------------------------------
  async revenueReport() {
    // Get all contracts and payments
    const [contracts, payments] = await Promise.all([
      this.prisma.contract.findMany({
        where: { status: { in: ['ACTIVE', 'SIGNED'] } },
        select: { totalAmt: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.payment.findMany({
        where: { status: 'COMPLETED' },
        select: { amount: true, date: true },
        orderBy: { date: 'asc' },
      }),
    ]);

    // Group by year-month
    const monthMap = new Map<string, { booked: number; collected: number }>();

    const getKey = (d: Date) => {
      return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

    for (const c of contracts) {
      const key = getKey(new Date(c.createdAt));
      const existing = monthMap.get(key) ?? { booked: 0, collected: 0 };
      existing.booked += Number(c.totalAmt);
      monthMap.set(key, existing);
    }

    for (const p of payments) {
      const key = getKey(new Date(p.date));
      const existing = monthMap.get(key) ?? { booked: 0, collected: 0 };
      existing.collected += Number(p.amount);
      monthMap.set(key, existing);
    }

    // Sort months chronologically
    const sortedEntries = [...monthMap.entries()].sort(([a], [b]) => {
      return new Date(a).getTime() - new Date(b).getTime();
    });

    // Rolling outstanding
    let cumulativeBooked = 0;
    let cumulativeCollected = 0;

    return sortedEntries.map(([period, data]) => {
      cumulativeBooked += data.booked;
      cumulativeCollected += data.collected;
      const outstanding = cumulativeBooked - cumulativeCollected;
      const forecast = data.booked * 1.05; // simple 5% growth forecast

      return {
        period,
        booked: this.formatCurrency(data.booked),
        collected: this.formatCurrency(data.collected),
        outstanding: this.formatCurrency(outstanding),
        forecast: this.formatCurrency(forecast),
      };
    });
  }

  // --------------------------------------------------------
  // Utility
  // --------------------------------------------------------
  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  }
}
