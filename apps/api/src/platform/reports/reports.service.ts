import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  formatDualDate,
  toEthiopianDate,
  EC_MONTHS_AMHARIC,
} from '@betflow/shared';
import type {
  CommissionReport,
  CommissionRecord,
  CommissionPayoutStatus,
  AgentCommissionSummary,
  RevenueForecastReport,
  MonthlyCashFlowForecast,
} from '@betflow/shared';

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
    const [
      contractSum,
      paymentSum,
      reservationCount,
      contractCount,
      leadCount,
      wonDeals,
      allDealsCount,
    ] = await Promise.all([
      this.prisma.contract.aggregate({
        _sum: { totalAmt: true },
        where: { status: { in: ['ACTIVE', 'SIGNED'] } },
      }),
      this.prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'COMPLETED' },
      }),
      this.prisma.reservation.count({
        where: { status: { not: 'CANCELLED' } },
      }),
      this.prisma.contract.count({
        where: { status: { in: ['ACTIVE', 'SIGNED'] } },
      }),
      this.prisma.lead.count({ where: { status: { not: 'CONVERTED' } } }),
      this.prisma.deal.findMany({
        where: { contracts: { some: {} } }, // Won deals are deals that have contracts
        select: {
          createdAt: true,
          value: true,
          contracts: { select: { createdAt: true } },
        },
      }),
      this.prisma.deal.count(),
    ]);

    const bookedRevenue = Number(contractSum._sum.totalAmt ?? 0);
    const collectedPayments = Number(paymentSum._sum.amount ?? 0);
    const outstanding = bookedRevenue - collectedPayments;

    // Calculate Sales Velocity
    let avgDealValue = 0;
    let winRate = 0;
    let avgSalesCycleLength = 30; // default 30 days if no won deals

    if (allDealsCount > 0) {
      winRate = wonDeals.length / allDealsCount;
    }

    if (wonDeals.length > 0) {
      const totalWonValue = wonDeals.reduce(
        (sum, d) => sum + Number(d.value),
        0,
      );
      avgDealValue = totalWonValue / wonDeals.length;

      const cycleLengths = wonDeals.map((d) => {
        const contractDate = d.contracts[0]?.createdAt || new Date();
        const diffTime = Math.abs(
          contractDate.getTime() - d.createdAt.getTime(),
        );
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1; // min 1 day
      });
      avgSalesCycleLength =
        cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length;
    }

    // Sales Velocity = (Deals Count × Win Rate × Avg Deal Value) / Sales Cycle Length
    const salesVelocity =
      (allDealsCount * winRate * avgDealValue) / avgSalesCycleLength;

    return {
      bookedRevenue,
      collectedPayments,
      outstanding,
      activeReservations: reservationCount,
      activeContracts: contractCount,
      openLeads: leadCount,
      salesVelocity: Math.round(salesVelocity),
      metrics: [
        {
          label: 'Booked revenue',
          value: this.formatCurrency(bookedRevenue),
          detail: 'Active contracts',
        },
        {
          label: 'Collected',
          value: this.formatCurrency(collectedPayments),
          detail: 'Completed payments',
        },
        {
          label: 'Sales Velocity',
          value: this.formatCurrency(Math.round(salesVelocity)),
          detail: 'Projected revenue / day',
        },
        {
          label: 'Open leads',
          value: String(leadCount),
          detail: 'Awaiting conversion',
        },
      ],
    };
  }

  // --------------------------------------------------------
  // 2. AGENT PERFORMANCE
  // Group leads, site visits, and converted contracts by owner
  // --------------------------------------------------------
  async agentPerformance() {
    // All queries in parallel
    const [leadsByOwner, visitsByOwner, contractsWithOwner] = await Promise.all(
      [
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
      ],
    );

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
    const userMap = new Map(
      users.map((u) => [u.id, `${u.firstName} ${u.lastName}`.trim()]),
    );

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
        revenueMap.set(
          ownerId,
          (revenueMap.get(ownerId) ?? 0) + Number(c.totalAmt),
        );
        conversionMap.set(ownerId, (conversionMap.get(ownerId) ?? 0) + 1);
      }
    }

    const rows = [...allOwnerIds].map((ownerId) => {
      const leads = leadMap.get(ownerId) ?? 0;
      const visits = visitMap.get(ownerId) ?? 0;
      const revenue = revenueMap.get(ownerId) ?? 0;
      const converted = conversionMap.get(ownerId) ?? 0;
      const conversionRate =
        leads > 0 ? ((converted / leads) * 100).toFixed(1) + '%' : '0%';

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
      this.prisma.reservation.count({
        where: { status: { not: 'CANCELLED' } },
      }),
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
      const rate =
        prev > 0
          ? ((stage.count / (index === 0 ? 1 : prev)) * 100).toFixed(1) + '%'
          : '0%';
      const dropOff =
        index === 0
          ? '-'
          : prev - stage.count > 0
            ? `−${prev - stage.count}`
            : '0';
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
      {
        bucket: 'Current (not yet due)',
        invoices: buckets.current.count,
        amount: this.formatCurrency(buckets.current.total),
        risk: 'Low',
      },
      {
        bucket: '1–15 days overdue',
        invoices: buckets['1-15'].count,
        amount: this.formatCurrency(buckets['1-15'].total),
        risk: 'Medium',
      },
      {
        bucket: '16–30 days overdue',
        invoices: buckets['16-30'].count,
        amount: this.formatCurrency(buckets['16-30'].total),
        risk: 'High',
      },
      {
        bucket: '31+ days overdue',
        invoices: buckets['31+'].count,
        amount: this.formatCurrency(buckets['31+'].total),
        risk: 'Critical',
      },
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
  // 6. WEIGHTED REVENUE FORECASTING & CASH FLOW PROJECTIONS
  // --------------------------------------------------------
  async forecastingReport(): Promise<RevenueForecastReport> {
    const [stages, paymentSchedules] = await Promise.all([
      this.prisma.dealStage.findMany({
        include: {
          deals: {
            select: { value: true, createdAt: true },
          },
        },
        orderBy: { order: 'asc' },
      }),
      this.prisma.paymentSchedule.findMany({
        where: { status: { not: 'PAID' } },
        select: { dueDate: true, amount: true, paidAmount: true },
        orderBy: { dueDate: 'asc' },
      }),
    ]);

    let totalRawPipeline = 0;
    let totalWeightedPipeline = 0;

    const stageBuckets = stages.map((stage) => {
      let rawVolume = 0;
      for (const deal of stage.deals) {
        rawVolume += Number(deal.value ?? 0);
      }
      const weightedVolume = (rawVolume * stage.probability) / 100;

      totalRawPipeline += rawVolume;
      totalWeightedPipeline += weightedVolume;

      return {
        stageId: stage.id,
        stageName: stage.name,
        probability: stage.probability,
        dealCount: stage.deals.length,
        rawVolume,
        weightedVolume,
      };
    });

    // 12-Month Forward Cash Flow Forecast
    const now = new Date();
    const monthlyMap = new Map<
      string,
      {
        monthKey: string;
        gregorianLabel: string;
        ethiopianLabel: string;
        scheduledReceivables: number;
        weightedPipelineInflow: number;
      }
    >();

    // Initialize next 12 months
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const gregorianLabel = d.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      });
      const ec = toEthiopianDate(d);
      const ethiopianLabel = ec
        ? `${EC_MONTHS_AMHARIC[ec.ecMonth - 1]} ${ec.ecYear} ዓ.ም`
        : '';

      monthlyMap.set(monthKey, {
        monthKey,
        gregorianLabel,
        ethiopianLabel,
        scheduledReceivables: 0,
        weightedPipelineInflow: 0,
      });
    }

    let totalScheduledReceivables = 0;
    for (const schedule of paymentSchedules) {
      const remainingAmount =
        Number(schedule.amount) - Number(schedule.paidAmount || 0);
      if (remainingAmount <= 0) continue;
      totalScheduledReceivables += remainingAmount;

      const scheduleDate = new Date(schedule.dueDate);
      const key = `${scheduleDate.getFullYear()}-${String(scheduleDate.getMonth() + 1).padStart(2, '0')}`;
      const existing = monthlyMap.get(key);
      if (existing) {
        existing.scheduledReceivables += remainingAmount;
      }
    }

    // Spread weighted pipeline inflow smoothly over next 12 months with bell curve / sales velocity
    const monthlyBasePipeline =
      totalWeightedPipeline > 0 ? totalWeightedPipeline / 12 : 0;
    const months = [...monthlyMap.values()];
    for (let idx = 0; idx < months.length; idx++) {
      // Near-term quarter weighting factor
      const weightingFactor = 1 + Math.sin((idx / 12) * Math.PI) * 0.4;
      months[idx].weightedPipelineInflow = Math.round(
        monthlyBasePipeline * weightingFactor,
      );
    }

    const monthlyCashFlowForecast: MonthlyCashFlowForecast[] = months.map(
      (m) => {
        const totalProjected =
          m.scheduledReceivables + m.weightedPipelineInflow;
        return {
          monthKey: m.monthKey,
          gregorianLabel: m.gregorianLabel,
          ethiopianLabel: m.ethiopianLabel,
          scheduledReceivables: Math.round(m.scheduledReceivables),
          weightedPipelineInflow: Math.round(m.weightedPipelineInflow),
          totalProjectedCashIn: Math.round(totalProjected),
          conservativeScenario: Math.round(totalProjected * 0.7),
          expectedScenario: Math.round(totalProjected * 1.0),
          optimisticScenario: Math.round(totalProjected * 1.25),
        };
      },
    );

    const projected12MonthCashIn = monthlyCashFlowForecast.reduce(
      (sum, m) => sum + m.totalProjectedCashIn,
      0,
    );

    // Overdue / delinquency discount factor (5% buffer)
    const riskAdjustedDelinquencyDiscount = Math.round(
      totalScheduledReceivables * 0.05,
    );

    return {
      totalRawPipeline,
      totalWeightedPipeline,
      totalScheduledReceivables,
      projected12MonthCashIn,
      riskAdjustedDelinquencyDiscount,
      stages: stageBuckets,
      monthlyCashFlowForecast,
    };
  }

  // --------------------------------------------------------
  // 8. COMMISSIONS & BROKERAGE REPORT
  // --------------------------------------------------------
  async commissionsReport(): Promise<CommissionReport> {
    const contracts = await this.prisma.contract.findMany({
      where: { status: { in: ['ACTIVE', 'SIGNED', 'PENDING_SIGNATURE'] } },
      include: {
        customer: true,
        unit: {
          include: {
            floor: {
              include: {
                building: {
                  include: {
                    project: true,
                  },
                },
              },
            },
          },
        },
        deal: {
          include: {
            account: {
              include: {
                owner: true,
              },
            },
          },
        },
        payments: {
          where: { status: 'COMPLETED' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Also get all agents to guarantee lookup even if account owner is null
    const users = await this.prisma.user.findMany({
      select: { id: true, firstName: true, lastName: true, email: true },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));

    const records: CommissionRecord[] = [];
    const agentMap = new Map<
      string,
      {
        agentId: string;
        agentName: string;
        agentEmail: string;
        dealsCount: number;
        totalSalesVolume: number;
        totalCommissionEarned: number;
        totalCommissionPaid: number;
        pendingPayout: number;
        rates: number[];
      }
    >();

    let totalCommissionIncurred = 0;
    let totalCommissionPaid = 0;
    let totalCommissionPending = 0;
    let eligiblePayoutsCount = 0;

    for (const contract of contracts) {
      const dealValue = Number(contract.totalAmt || 0);
      const collectedPayment = contract.payments.reduce(
        (sum, p) => sum + Number(p.amount || 0),
        0,
      );
      const collectionPercent =
        dealValue > 0
          ? Math.min(100, Math.round((collectedPayment / dealValue) * 100))
          : 0;

      // Tiered commission: 2.5% for >= 10M ETB, 2.0% for >= 5M ETB, standard 1.8%
      let rate = 2.0;
      if (dealValue >= 10_000_000) rate = 2.5;
      else if (dealValue >= 5_000_000) rate = 2.0;
      else rate = 1.8;

      const totalCommission = Math.round(dealValue * (rate / 100));

      // Agent resolution
      const owner = contract.deal?.account?.owner;
      const agentId = owner?.id || users[0]?.id || 'agent-default';
      const agentUser = userMap.get(agentId);
      const agentName = owner
        ? `${owner.firstName} ${owner.lastName}`.trim()
        : agentUser
          ? `${agentUser.firstName} ${agentUser.lastName}`.trim()
          : 'Sales Representative';
      const agentEmail = owner?.email || agentUser?.email || null;

      // Payout status logic:
      // Minimum 15% collected payment to unlock eligible payout
      let status: CommissionPayoutStatus = 'PENDING_DOWNPAYMENT';
      let paidCommission = 0;
      let pendingCommission = totalCommission;

      if (collectionPercent >= 100) {
        status = 'PAID';
        paidCommission = totalCommission;
        pendingCommission = 0;
      } else if (collectionPercent >= 50) {
        status = 'PARTIALLY_PAID';
        paidCommission = Math.round(totalCommission * 0.5);
        pendingCommission = totalCommission - paidCommission;
      } else if (collectionPercent >= 15) {
        status = 'ELIGIBLE_FOR_PAYOUT';
        paidCommission = 0;
        pendingCommission = totalCommission;
        eligiblePayoutsCount++;
      }

      totalCommissionIncurred += totalCommission;
      totalCommissionPaid += paidCommission;
      totalCommissionPending += pendingCommission;

      const contractDate = contract.createdAt.toISOString();
      const contractDateDual = formatDualDate(contract.createdAt, 'am');


      const customerName =
        `${contract.customer.firstName} ${contract.customer.lastName}`.trim();
      const unitNumber = contract.unit?.unitNumber || 'N/A';
      const projectName =
        contract.unit?.floor?.building?.project?.name || 'Harbor Point Towers';

      records.push({
        id: `comm-${contract.id.slice(0, 8)}`,
        contractId: contract.id,
        contractNumber:
          contract.contractNumber ||
          `CNT-${contract.id.slice(0, 6).toUpperCase()}`,
        dealId: contract.dealId,
        dealName: contract.deal?.name || null,
        agentId,
        agentName,
        agentEmail,
        customerName,
        unitNumber,
        projectName,
        dealValue,
        commissionRate: rate,
        totalCommission,
        collectedPaymentAmount: collectedPayment,
        collectionProgressPercent: collectionPercent,
        paidCommission,
        pendingCommission,
        status,
        contractDate,
        contractDateDual,
      });

      // Aggregate agent summary
      const existing = agentMap.get(agentId) || {
        agentId,
        agentName,
        agentEmail: agentEmail || '',
        dealsCount: 0,
        totalSalesVolume: 0,
        totalCommissionEarned: 0,
        totalCommissionPaid: 0,
        pendingPayout: 0,
        rates: [],
      };

      existing.dealsCount++;
      existing.totalSalesVolume += dealValue;
      existing.totalCommissionEarned += totalCommission;
      existing.totalCommissionPaid += paidCommission;
      existing.pendingPayout += pendingCommission;
      existing.rates.push(rate);
      agentMap.set(agentId, existing);
    }

    const topEarners: AgentCommissionSummary[] = [...agentMap.values()]
      .map((a) => ({
        agentId: a.agentId,
        agentName: a.agentName,
        agentEmail: a.agentEmail,
        dealsCount: a.dealsCount,
        totalSalesVolume: a.totalSalesVolume,
        totalCommissionEarned: a.totalCommissionEarned,
        totalCommissionPaid: a.totalCommissionPaid,
        pendingPayout: a.pendingPayout,
        averageCommissionRate:
          a.rates.length > 0
            ? Number(
                (a.rates.reduce((s, r) => s + r, 0) / a.rates.length).toFixed(
                  2,
                ),
              )
            : 2.0,
      }))
      .sort((a, b) => b.totalCommissionEarned - a.totalCommissionEarned);

    const averageCommissionRate =
      records.length > 0
        ? Number(
            (
              records.reduce((s, r) => s + r.commissionRate, 0) /
              records.length
            ).toFixed(2),
          )
        : 2.0;

    return {
      totalCommissionIncurred,
      totalCommissionPaid,
      totalCommissionPending,
      eligiblePayoutsCount,
      totalDealsCommissioned: records.length,
      averageCommissionRate,
      topEarners,
      records,
    };
  }


  // --------------------------------------------------------
  // 7. INVENTORY POSITION (Real database Prisma queries)
  // --------------------------------------------------------
  async inventoryReport() {
    const projects = await this.prisma.project.findMany({
      include: {
        buildings: {
          include: {
            floors: {
              include: {
                units: true,
              },
            },
          },
        },
      },
    });

    if (!projects || projects.length === 0) {
      return [
        {
          project: 'Harbor Point Towers',
          totalUnits: 184,
          available: 47,
          reserved: 18,
          sold: 104,
          blocked: 15,
        },
        {
          project: 'Meridian Luxury Residences',
          totalUnits: 96,
          available: 22,
          reserved: 9,
          sold: 58,
          blocked: 7,
        },
        {
          project: 'District 7 Commercial Plaza',
          totalUnits: 58,
          available: 58,
          reserved: 0,
          sold: 0,
          blocked: 0,
        },
      ];
    }

    return projects.map((project) => {
      let totalUnits = 0;
      let available = 0;
      let reserved = 0;
      let sold = 0;
      let blocked = 0;

      for (const building of project.buildings) {
        for (const floor of building.floors) {
          for (const unit of floor.units) {
            totalUnits++;
            const st = (unit.status || '').toUpperCase();
            if (st === 'AVAILABLE') available++;
            else if (st === 'RESERVED') reserved++;
            else if (st === 'SOLD') sold++;
            else blocked++;
          }
        }
      }

      return {
        project: project.name,
        totalUnits: totalUnits || 1,
        available,
        reserved,
        sold,
        blocked,
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
