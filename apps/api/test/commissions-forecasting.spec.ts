import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from '../src/platform/reports/reports.service';
import { PrismaService } from '../src/database/prisma.service';

describe('ReportsService - Commissions & Enhanced Forecasting', () => {
  let service: ReportsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      contract: {
        findMany: jest.fn(),
        aggregate: jest.fn(),
        count: jest.fn(),
      },
      deal: {
        findMany: jest.fn(),
        count: jest.fn(),
      },
      payment: {
        findMany: jest.fn(),
        aggregate: jest.fn(),
      },
      reservation: {
        count: jest.fn(),
      },
      lead: {
        count: jest.fn(),
      },
      dealStage: {
        findMany: jest.fn(),
      },
      paymentSchedule: {
        findMany: jest.fn(),
      },
      user: {
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
  });

  describe('commissionsReport()', () => {
    it('should calculate tiered commissions, payout statuses, and dual-calendar contract dates', async () => {
      const mockContracts = [
        {
          id: 'contract-1',
          contractNumber: 'CNT-2026-001',
          totalAmt: '12000000', // 12M -> 2.5% = 300,000
          createdAt: new Date('2026-09-11T10:00:00Z'), // 2019 EC New Year
          dealId: 'deal-1',
          deal: {
            id: 'deal-1',
            name: 'Harbor Penthouse Deal',
            account: {
              owner: {
                id: 'agent-1',
                firstName: 'Abebe',
                lastName: 'Kebede',
                email: 'abebe@betflow.et',
              },
            },
          },
          customer: {
            id: 'cust-1',
            firstName: 'Tadesse',
            lastName: 'Alemu',
          },
          unit: {
            unitNumber: 'PH-1201',
            floor: {
              building: {
                project: {
                  name: 'Harbor Point Towers',
                },
              },
            },
          },
          payments: [
            { id: 'pay-1', amount: '3600000', status: 'COMPLETED' }, // 30% collected
          ],
        },
        {
          id: 'contract-2',
          contractNumber: 'CNT-2026-002',
          totalAmt: '4000000', // 4M -> 1.8% = 72,000
          createdAt: new Date('2026-06-15T10:00:00Z'),
          dealId: 'deal-2',
          deal: {
            id: 'deal-2',
            name: '2-Bed City View',
            account: {
              owner: {
                id: 'agent-2',
                firstName: 'Bethlehem',
                lastName: 'Haile',
                email: 'bethlehem@betflow.et',
              },
            },
          },
          customer: {
            id: 'cust-2',
            firstName: 'Marta',
            lastName: 'Girma',
          },
          unit: {
            unitNumber: 'B-402',
            floor: {
              building: {
                project: {
                  name: 'Meridian Residences',
                },
              },
            },
          },
          payments: [
            { id: 'pay-2', amount: '4000000', status: 'COMPLETED' }, // 100% collected
          ],
        },
      ];

      prisma.contract.findMany.mockResolvedValue(mockContracts);
      prisma.user.findMany.mockResolvedValue([
        { id: 'agent-1', firstName: 'Abebe', lastName: 'Kebede', email: 'abebe@betflow.et' },
        { id: 'agent-2', firstName: 'Bethlehem', lastName: 'Haile', email: 'bethlehem@betflow.et' },
      ]);

      const report = await service.commissionsReport();

      expect(report).toBeDefined();
      expect(report.totalDealsCommissioned).toBe(2);
      expect(report.records.length).toBe(2);

      // Contract 1 verification
      const rec1 = report.records[0];
      expect(rec1.dealValue).toBe(12000000);
      expect(rec1.commissionRate).toBe(2.5); // Tier >= 10M
      expect(rec1.totalCommission).toBe(300000);
      expect(rec1.collectionProgressPercent).toBe(30);
      expect(rec1.status).toBe('ELIGIBLE_FOR_PAYOUT'); // 30% collected >= 15%
      expect(rec1.contractDateDual).toContain('2019'); // Ethiopian Calendar check

      // Contract 2 verification
      const rec2 = report.records[1];
      expect(rec2.dealValue).toBe(4000000);
      expect(rec2.commissionRate).toBe(1.8); // Tier < 5M
      expect(rec2.totalCommission).toBe(72000);
      expect(rec2.collectionProgressPercent).toBe(100);
      expect(rec2.status).toBe('PAID'); // 100% collected
      expect(rec2.paidCommission).toBe(72000);
      expect(rec2.pendingCommission).toBe(0);

      // Totals verification
      expect(report.totalCommissionIncurred).toBe(372000);
      expect(report.totalCommissionPaid).toBe(72000);
      expect(report.totalCommissionPending).toBe(300000);
      expect(report.eligiblePayoutsCount).toBe(1);

      // Leaderboard
      expect(report.topEarners.length).toBe(2);
      expect(report.topEarners[0].agentName).toBe('Abebe Kebede');
      expect(report.topEarners[0].totalCommissionEarned).toBe(300000);
    });
  });

  describe('forecastingReport()', () => {
    it('should generate 12-month forward cash flows with dual Ethiopian labels and 3-scenario projections', async () => {
      prisma.dealStage.findMany.mockResolvedValue([
        {
          id: 'stage-1',
          name: 'Site Visit Completed',
          order: 1,
          probability: 25,
          deals: [
            { value: '10000000', createdAt: new Date() },
            { value: '6000000', createdAt: new Date() },
          ],
        },
        {
          id: 'stage-2',
          name: 'Contract Drafting',
          order: 2,
          probability: 80,
          deals: [
            { value: '5000000', createdAt: new Date() },
          ],
        },
      ]);

      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      prisma.paymentSchedule.findMany.mockResolvedValue([
        {
          dueDate: nextMonth,
          amount: '1500000',
          paidAmount: '0',
          status: 'PENDING',
        },
      ]);

      const forecast = await service.forecastingReport();

      expect(forecast).toBeDefined();
      expect(forecast.totalRawPipeline).toBe(21000000); // 16M + 5M
      // Weighted: 16M * 0.25 (4M) + 5M * 0.8 (4M) = 8M
      expect(forecast.totalWeightedPipeline).toBe(8000000);
      expect(forecast.totalScheduledReceivables).toBe(1500000);

      // 12-Month cash flow verification
      expect(forecast.monthlyCashFlowForecast.length).toBe(12);

      const firstMonth = forecast.monthlyCashFlowForecast[0];
      expect(firstMonth.gregorianLabel).toBeDefined();
      expect(firstMonth.ethiopianLabel).toContain('ዓ.ም');
      expect(firstMonth.conservativeScenario).toBe(Math.round(firstMonth.totalProjectedCashIn * 0.7));
      expect(firstMonth.expectedScenario).toBe(firstMonth.totalProjectedCashIn);
      expect(firstMonth.optimisticScenario).toBe(Math.round(firstMonth.totalProjectedCashIn * 1.25));

      expect(forecast.projected12MonthCashIn).toBeGreaterThan(0);
      expect(forecast.riskAdjustedDelinquencyDiscount).toBe(Math.round(1500000 * 0.05));
    });
  });
});
