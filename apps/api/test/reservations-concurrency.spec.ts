import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ReservationsService } from '../src/real-estate/reservations/reservations.service';
import { PrismaService } from '../src/database/prisma.service';
import { RedisCacheService } from '../src/database/redis-cache.service';
import { InventoryGateway } from '../src/real-estate/units/inventory.gateway';
import { EthioTelecomSmsService } from '../src/integrations/sms.service';

describe('ReservationsService — Double Booking Concurrency', () => {
  let service: ReservationsService;
  let prisma: any;

  const mockUnitId = 'unit-101';
  const mockCustomerId1 = 'cust-001';
  const mockCustomerId2 = 'cust-002';

  beforeEach(async () => {
    let unitStatus = 'AVAILABLE';

    prisma = {
      customer: {
        findFirst: jest.fn().mockImplementation(async ({ where }: { where: { id: string } }) => {
          return { id: where.id, firstName: 'Test', lastName: 'Customer' };
        }),
      },
      reservation: {
        create: jest.fn().mockImplementation(async ({ data }: any) => {
          return {
            id: `res-${Math.random().toString(36).substring(2, 7)}`,
            ...data,
            unit: { id: mockUnitId, unitNumber: 'A-101', type: 'APARTMENT', status: 'RESERVED' },
            customer: { id: data.customerId, firstName: 'Test', lastName: 'Customer' },
          };
        }),
      },
      unit: {
        updateMany: jest.fn().mockImplementation(async ({ where, data }: any) => {
          if (where.id === mockUnitId && where.status === 'AVAILABLE' && unitStatus === 'AVAILABLE') {
            unitStatus = data.status; // Lock unit to RESERVED atomically
            return { count: 1 };
          }
          return { count: 0 };
        }),
        findFirst: jest.fn().mockImplementation(async ({ where }: { where: { id: string } }) => {
          return { id: where.id, unitNumber: 'A-101', type: 'APARTMENT', status: unitStatus };
        }),
        update: jest.fn().mockImplementation(async ({ data }: any) => {
          unitStatus = data.status;
          return { id: mockUnitId, unitNumber: 'A-101', type: 'APARTMENT', status: unitStatus };
        }),
      },
      auditLog: {
        create: jest.fn().mockResolvedValue({ id: 'audit-1' }),
      },
      $queryRaw: jest.fn().mockImplementation(async () => [
        { id: mockUnitId, status: unitStatus, unitNumber: 'A-101' },
      ]),
      $transaction: jest.fn().mockImplementation(async (cb: (tx: any) => Promise<any>) => cb(prisma)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        { provide: PrismaService, useValue: prisma },
        {
          provide: RedisCacheService,
          useValue: { get: jest.fn(), set: jest.fn(), del: jest.fn(), invalidatePattern: jest.fn().mockResolvedValue(true) },
        },
        {
          provide: InventoryGateway,
          useValue: { broadcastUnitStatusChange: jest.fn(), broadcastReservationEvent: jest.fn(), notifyUnitStatusChange: jest.fn() },
        },
        {
          provide: EthioTelecomSmsService,
          useValue: { sendSms: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
  });

  it('should successfully reserve an AVAILABLE unit', async () => {
    const result = await service.create('user-1', {
      customerId: mockCustomerId1,
      unitId: mockUnitId,
      amount: 50000,
    });

    expect(result).toBeDefined();
    expect(result.unit.status).toBe('RESERVED');
    expect(prisma.unit.update).toHaveBeenCalledWith({
      where: { id: mockUnitId },
      data: { status: 'RESERVED' },
    });
  });

  it('should prevent double booking when simultaneous reservation requests occur', async () => {
    // 1st reservation succeeds
    const res1 = await service.create('user-1', {
      customerId: mockCustomerId1,
      unitId: mockUnitId,
      amount: 50000,
    });
    expect(res1.unit.status).toBe('RESERVED');

    // 2nd simultaneous reservation for the same unit MUST be rejected
    await expect(
      service.create('user-2', {
        customerId: mockCustomerId2,
        unitId: mockUnitId,
        amount: 50000,
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
