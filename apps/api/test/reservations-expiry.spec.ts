import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsService } from '../src/real-estate/reservations/reservations.service';
import { ReservationsCronService } from '../src/real-estate/reservations/reservations-cron.service';
import { PrismaService } from '../src/database/prisma.service';

describe('ReservationsCronService — Automated Expiry', () => {
  let cronService: ReservationsCronService;
  let reservationsService: ReservationsService;
  let prisma: any;

  const mockExpiredReservation = {
    id: 'res-expired-100',
    customerId: 'cust-1',
    unitId: 'unit-locked-1',
    status: 'PENDING',
    expiryDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Expired 24 hours ago
    unit: { id: 'unit-locked-1', unitNumber: 'B-402', status: 'RESERVED' },
    customer: { id: 'cust-1', firstName: 'John', lastName: 'Doe' },
  };

  beforeEach(async () => {
    prisma = {
      reservation: {
        findMany: jest.fn().mockResolvedValue([mockExpiredReservation]),
        update: jest.fn().mockResolvedValue({ ...mockExpiredReservation, status: 'EXPIRED' }),
      },
      unit: {
        update: jest.fn().mockResolvedValue({ id: 'unit-locked-1', status: 'AVAILABLE' }),
      },
      auditLog: {
        create: jest.fn().mockResolvedValue({ id: 'audit-expired-1' }),
      },
      $transaction: jest.fn().mockImplementation(async (cb: (tx: any) => Promise<any>) => cb(prisma)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        ReservationsCronService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    reservationsService = module.get<ReservationsService>(ReservationsService);
    cronService = module.get<ReservationsCronService>(ReservationsCronService);
  });

  it('should process expired reservations and release unit status to AVAILABLE', async () => {
    const processedCount = await reservationsService.processExpiredReservations();

    expect(processedCount).toBe(1);

    // Verify reservation status updated to EXPIRED
    expect(prisma.reservation.update).toHaveBeenCalledWith({
      where: { id: mockExpiredReservation.id },
      data: { status: 'EXPIRED' },
    });

    // Verify unit status updated back to AVAILABLE
    expect(prisma.unit.update).toHaveBeenCalledWith({
      where: { id: mockExpiredReservation.unitId },
      data: { status: 'AVAILABLE' },
    });

    // Verify audit log creation
    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: 'reservation.auto_expired',
        entityId: mockExpiredReservation.id,
      }),
    });
  });

  it('should run handleExpiredReservations cron handler cleanly', async () => {
    jest.spyOn(reservationsService, 'processExpiredReservations').mockResolvedValue(1);

    await cronService.handleExpiredReservations();

    expect(reservationsService.processExpiredReservations).toHaveBeenCalled();
  });
});
