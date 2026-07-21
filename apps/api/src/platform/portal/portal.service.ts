import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { JwtService } from '../../core/auth/jwt.service';
import { PasswordService } from '../../core/auth/password.service';

export type PortalLoginDto = {
  email: string;
  password?: string;
};

@Injectable()
export class PortalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly passwords: PasswordService,
  ) {}

  /**
   * Resolves or auto-creates a customer profile linked to the user's email.
   */
  private async getCustomerForEmail(email: string, userId?: string) {
    let customer = await this.prisma.customer.findFirst({
      where: {
        email: { equals: email, mode: 'insensitive' },
      },
      include: {
        account: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    // Fallback: If no customer record exists with this email, search if there is a customer named after user or create one
    if (!customer && userId) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (user) {
        customer = await this.prisma.customer.create({
          data: {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
          },
          include: {
            account: { select: { id: true, name: true, email: true, phone: true } },
          },
        });
      }
    }

    return customer;
  }

  /**
   * Customer / Portal login endpoint.
   */
  async portalLogin(body: PortalLoginDto) {
    if (!body.email?.trim()) {
      throw new UnauthorizedException('Email is required');
    }

    const email = body.email.trim().toLowerCase();
    const user = await this.prisma.user.findFirst({
      where: { email, isActive: true },
    });

    if (user && body.password) {
      const match = await this.passwords.verify(body.password, user.password);
      if (!match) {
        throw new UnauthorizedException('Invalid customer credentials');
      }
    } else if (!user) {
      // Check if a customer record exists with this email
      const customer = await this.prisma.customer.findFirst({
        where: { email: { equals: email, mode: 'insensitive' } },
      });
      if (!customer) {
        throw new UnauthorizedException('Customer email not found');
      }
    }

    const targetUserId = user ? user.id : 'customer-' + email;
    const targetEmail = user ? user.email : email;
    const expiresIn = 86400; // 24 hours

    const token = this.jwt.sign(
      {
        sub: targetUserId,
        email: targetEmail,
        roles: ['Customer'],
      },
      expiresIn,
    );

    const customer = await this.getCustomerForEmail(targetEmail, user?.id);

    return {
      accessToken: token,
      customer: customer ?? { email: targetEmail },
      expiresIn,
    };
  }

  /**
   * GET /portal/me — returns details of the logged-in customer's active deals, reserved units, and signed contracts.
   */
  async getPortalMe(userEmail: string, userId: string) {
    const customer = await this.getCustomerForEmail(userEmail, userId);

    if (!customer) {
      throw new NotFoundException(`No customer profile found for email ${userEmail}`);
    }

    const customerId = customer.id;

    // Retrieve deals, reservations, and contracts in parallel
    const [deals, reservations, contracts] = await Promise.all([
      this.prisma.deal.findMany({
        where: { customerId },
        include: {
          stage: { select: { id: true, name: true, probability: true } },
          unit: {
            include: {
              floor: {
                include: {
                  building: {
                    include: { project: { select: { id: true, name: true } } },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.reservation.findMany({
        where: { customerId },
        include: {
          unit: {
            include: {
              floor: {
                include: {
                  building: {
                    include: { project: { select: { id: true, name: true } } },
                  },
                },
              },
            },
          },
          payments: true,
        },
        orderBy: { date: 'desc' },
      }),
      this.prisma.contract.findMany({
        where: { customerId },
        include: {
          unit: {
            include: {
              floor: {
                include: {
                  building: {
                    include: { project: { select: { id: true, name: true } } },
                  },
                },
              },
            },
          },
          schedules: { orderBy: { dueDate: 'asc' } },
          payments: { orderBy: { date: 'desc' } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    // Financial totals calculation
    const totalBooked = contracts.reduce((sum, c) => sum + Number(c.totalAmt), 0);
    const totalPaid = contracts.reduce(
      (sum, c) =>
        sum +
        c.payments
          .filter((p) => p.status === 'COMPLETED')
          .reduce((s, p) => s + Number(p.amount), 0),
      0,
    );
    const totalOutstanding = Math.max(0, totalBooked - totalPaid);

    return {
      customer: {
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        account: customer.account,
      },
      summary: {
        activeDealsCount: deals.length,
        reservedUnitsCount: reservations.length,
        signedContractsCount: contracts.length,
        totalBookedRevenue: totalBooked,
        totalCollectedPayments: totalPaid,
        totalOutstandingBalance: totalOutstanding,
      },
      deals: deals.map((d) => ({
        id: d.id,
        name: d.name,
        value: Number(d.value),
        stage: d.stage.name,
        probability: d.stage.probability,
        createdAt: d.createdAt,
        unit: d.unit
          ? {
              id: d.unit.id,
              unitNumber: d.unit.unitNumber,
              type: d.unit.type,
              price: Number(d.unit.price),
              status: d.unit.status,
              projectName:
                d.unit.floor?.building?.project?.name ?? 'Main Project',
            }
          : null,
      })),
      reservedUnits: reservations.map((r) => ({
        id: r.id,
        amount: Number(r.amount),
        status: r.status,
        date: r.date,
        unit: {
          id: r.unit.id,
          unitNumber: r.unit.unitNumber,
          type: r.unit.type,
          price: Number(r.unit.price),
          status: r.unit.status,
          buildingName: r.unit.floor?.building?.name,
          projectName:
            r.unit.floor?.building?.project?.name ?? 'Main Project',
        },
        paidAmount: r.payments.reduce((acc, p) => acc + Number(p.amount), 0),
      })),
      signedContracts: contracts.map((c) => ({
        id: c.id,
        startDate: c.startDate,
        endDate: c.endDate,
        totalAmt: Number(c.totalAmt),
        status: c.status,
        createdAt: c.createdAt,
        unit: {
          id: c.unit.id,
          unitNumber: c.unit.unitNumber,
          type: c.unit.type,
          price: Number(c.unit.price),
          status: c.unit.status,
          buildingName: c.unit.floor?.building?.name,
          projectName:
            c.unit.floor?.building?.project?.name ?? 'Main Project',
        },
        paidAmount: c.payments
          .filter((p) => p.status === 'COMPLETED')
          .reduce((sum, p) => sum + Number(p.amount), 0),
        pendingSchedulesCount: c.schedules.filter((s) => s.status !== 'PAID').length,
      })),
    };
  }

  /**
   * GET /portal/payment-schedules — billing statements & payment schedule entries.
   */
  async getPaymentSchedules(userEmail: string, userId: string) {
    const customer = await this.getCustomerForEmail(userEmail, userId);
    if (!customer) {
      return { schedules: [], summary: { totalDue: 0, totalPaid: 0, totalOverdue: 0, totalRemaining: 0 } };
    }

    const contracts = await this.prisma.contract.findMany({
      where: { customerId: customer.id },
      include: {
        unit: {
          include: {
            floor: {
              include: {
                building: {
                  include: { project: { select: { name: true } } },
                },
              },
            },
          },
        },
        schedules: { orderBy: { dueDate: 'asc' } },
      },
    });

    const now = new Date();
    const allSchedules = contracts.flatMap((contract) =>
      contract.schedules.map((sched) => {
        const isOverdue = sched.status !== 'PAID' && new Date(sched.dueDate) < now;
        return {
          id: sched.id,
          contractId: contract.id,
          dueDate: sched.dueDate,
          amount: Number(sched.amount),
          status: isOverdue ? 'LATE' : sched.status,
          unitNumber: contract.unit.unitNumber,
          projectName: contract.unit.floor?.building?.project?.name ?? 'Main Project',
          buildingName: contract.unit.floor?.building?.name,
        };
      }),
    );

    const totalDue = allSchedules.reduce((s, item) => s + item.amount, 0);
    const totalPaid = allSchedules.filter((i) => i.status === 'PAID').reduce((s, item) => s + item.amount, 0);
    const totalOverdue = allSchedules.filter((i) => i.status === 'LATE').reduce((s, item) => s + item.amount, 0);

    return {
      schedules: allSchedules,
      summary: {
        totalDue,
        totalPaid,
        totalOverdue,
        totalRemaining: Math.max(0, totalDue - totalPaid),
      },
    };
  }

  /**
   * GET /portal/contracts — list signed unit contracts for the customer.
   */
  async getContracts(userEmail: string, userId: string) {
    const customer = await this.getCustomerForEmail(userEmail, userId);
    if (!customer) return [];

    const contracts = await this.prisma.contract.findMany({
      where: { customerId: customer.id },
      include: {
        unit: {
          include: {
            floor: {
              include: {
                building: {
                  include: { project: { select: { name: true } } },
                },
              },
            },
          },
        },
        schedules: { orderBy: { dueDate: 'asc' } },
        payments: { orderBy: { date: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return contracts.map((c) => ({
      id: c.id,
      startDate: c.startDate,
      endDate: c.endDate,
      totalAmt: Number(c.totalAmt),
      status: c.status,
      createdAt: c.createdAt,
      unit: {
        id: c.unit.id,
        unitNumber: c.unit.unitNumber,
        type: c.unit.type,
        price: Number(c.unit.price),
        status: c.unit.status,
        projectName: c.unit.floor?.building?.project?.name ?? 'Main Project',
      },
      schedules: c.schedules.map((s) => ({
        id: s.id,
        dueDate: s.dueDate,
        amount: Number(s.amount),
        status: s.status,
      })),
      payments: c.payments.map((p) => ({
        id: p.id,
        amount: Number(p.amount),
        date: p.date,
        method: p.method,
        status: p.status,
      })),
    }));
  }

  /**
   * GET /portal/documents — documents attached to customer or customer's contracts.
   */
  async getDocuments(userEmail: string, userId: string) {
    const customer = await this.getCustomerForEmail(userEmail, userId);
    if (!customer) return [];

    const contracts = await this.prisma.contract.findMany({
      where: { customerId: customer.id },
      select: { id: true },
    });
    const contractIds = contracts.map((c) => c.id);

    return this.prisma.document.findMany({
      where: {
        OR: [
          { entityType: 'Customer', entityId: customer.id },
          { entityType: 'Contract', entityId: { in: contractIds } },
        ],
      },
      orderBy: { uploadedAt: 'desc' },
    });
  }

  /**
   * GET /portal/invoices — billing receipts & payment entries.
   */
  async getInvoices(userEmail: string, userId: string) {
    const customer = await this.getCustomerForEmail(userEmail, userId);
    if (!customer) return [];

    const payments = await this.prisma.payment.findMany({
      where: {
        OR: [
          { contract: { customerId: customer.id } },
          { reservation: { customerId: customer.id } },
        ],
      },
      include: {
        contract: { select: { id: true, unit: { select: { unitNumber: true } } } },
        reservation: { select: { id: true, unit: { select: { unitNumber: true } } } },
      },
      orderBy: { date: 'desc' },
    });

    return payments.map((p) => ({
      id: p.id,
      amount: Number(p.amount),
      date: p.date,
      method: p.method,
      status: p.status,
      unitNumber: p.contract?.unit?.unitNumber || p.reservation?.unit?.unitNumber || 'N/A',
      reference: p.contractId
        ? `Contract #${p.contractId.slice(0, 8)}`
        : `Reservation #${p.reservationId?.slice(0, 8)}`,
    }));
  }
}
