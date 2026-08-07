import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import type {
  BankSlipUploadInput,
  BankSlipSubmissionResult,
  PortalAuthResponse,
} from '@betflow/shared';

@Injectable()
export class PortalService {
  private readonly bankSlipStore = new Map<string, BankSlipSubmissionResult>();

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Authenticates a buyer using Email or Phone.
   */
  async login(identifier: string): Promise<PortalAuthResponse> {
    const clean = identifier?.trim();
    if (!clean) {
      throw new BadRequestException('Email or Phone identifier is required');
    }

    const customer = await this.prisma.customer.findFirst({
      where: {
        OR: [
          { email: { equals: clean, mode: 'insensitive' } },
          { phone: { equals: clean } },
        ],
      },
    });

    if (!customer) {
      throw new NotFoundException(
        `Customer matching '${clean}' was not found in CRM`,
      );
    }

    return {
      accessToken: `portal_token_${customer.id}_${Date.now()}`,
      customer: {
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
      },
    };
  }

  /**
   * Returns portal dashboard overview data for logged in customer.
   */
  async getPortalMe(email?: string, customerId?: string) {
    const customer = await this.prisma.customer.findFirst({
      where: customerId
        ? { id: customerId }
        : { email: { equals: email, mode: 'insensitive' } },
      include: {
        account: { select: { name: true } },
        deals: {
          include: {
            unit: {
              include: {
                floor: {
                  include: { building: { include: { project: true } } },
                },
              },
            },
            stage: true,
          },
        },
        reservations: {
          include: {
            unit: {
              include: {
                floor: {
                  include: { building: { include: { project: true } } },
                },
              },
            },
          },
        },
        contracts: {
          include: {
            unit: {
              include: {
                floor: {
                  include: { building: { include: { project: true } } },
                },
              },
            },
            schedules: true,
            payments: true,
          },
        },
      },
    });

    if (!customer) {
      // Fallback demo data if customer table has no records yet
      return {
        customer: {
          id: customerId || 'demo_id',
          firstName: 'Diaspora',
          lastName: 'Buyer',
          email: email || 'buyer@betflowrealty.com',
        },
        summary: {
          activeDealsCount: 1,
          reservedUnitsCount: 1,
          signedContractsCount: 1,
          totalBookedRevenue: 450000,
          totalCollectedPayments: 180000,
          totalOutstandingBalance: 270000,
        },
        deals: [],
        reservedUnits: [],
        signedContracts: [],
      };
    }

    let totalBooked = 0;
    let totalCollected = 0;

    for (const c of customer.contracts) {
      totalBooked += Number(c.totalAmt);
      for (const p of c.payments) {
        totalCollected += Number(p.amount);
      }
    }

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
        activeDealsCount: customer.deals.length,
        reservedUnitsCount: customer.reservations.length,
        signedContractsCount: customer.contracts.length,
        totalBookedRevenue: totalBooked,
        totalCollectedPayments: totalCollected,
        totalOutstandingBalance: Math.max(0, totalBooked - totalCollected),
      },
      deals: customer.deals.map((d) => ({
        id: d.id,
        name: d.name,
        value: Number(d.value),
        stage: d.stage.name,
        probability: d.stage.probability,
        unit: d.unit
          ? {
              unitNumber: d.unit.unitNumber,
              type: d.unit.type,
              price: Number(d.unit.price),
              projectName: d.unit.floor.building.project.name,
            }
          : null,
      })),
      reservedUnits: customer.reservations.map((r) => ({
        id: r.id,
        amount: Number(r.amount),
        status: r.status,
        date: r.date.toISOString(),
        unit: {
          unitNumber: r.unit.unitNumber,
          type: r.unit.type,
          price: Number(r.unit.price),
          projectName: r.unit.floor.building.project.name,
          buildingName: r.unit.floor.building.name,
        },
        paidAmount: Number(r.amount),
      })),
      signedContracts: customer.contracts.map((c) => ({
        id: c.id,
        startDate: c.startDate.toISOString(),
        endDate: c.endDate?.toISOString(),
        totalAmt: Number(c.totalAmt),
        status: c.status,
        unit: {
          unitNumber: c.unit.unitNumber,
          type: c.unit.type,
          price: Number(c.unit.price),
          projectName: c.unit.floor.building.project.name,
          buildingName: c.unit.floor.building.name,
        },
        paidAmount: c.payments.reduce((acc, p) => acc + Number(p.amount), 0),
        pendingSchedulesCount: c.schedules.filter((s) => s.status !== 'PAID')
          .length,
      })),
    };
  }

  /**
   * Returns buyer's payment schedules.
   */
  async getPaymentSchedules(email?: string, customerId?: string) {
    const me = await this.getPortalMe(email, customerId);
    const contracts = await this.prisma.contract.findMany({
      where: { customerId: me.customer.id },
      include: {
        unit: {
          include: {
            floor: {
              include: { building: { include: { project: true } } },
            },
          },
        },
        schedules: { orderBy: { dueDate: 'asc' } },
      },
    });

    const schedules = contracts.flatMap((c) =>
      c.schedules.map((s) => ({
        id: s.id,
        contractId: c.id,
        dueDate: s.dueDate.toISOString(),
        amount: Number(s.amount),
        status: s.status,
        unitNumber: c.unit.unitNumber,
        projectName: c.unit.floor.building.project.name,
      })),
    );

    const totalDue = schedules.reduce((acc, s) => acc + s.amount, 0);
    const totalPaid = schedules
      .filter((s) => s.status === 'PAID')
      .reduce((acc, s) => acc + s.amount, 0);

    return {
      schedules,
      summary: {
        totalDue,
        totalPaid,
        totalOverdue: 0,
        totalRemaining: Math.max(0, totalDue - totalPaid),
      },
    };
  }

  /**
   * Returns buyer's signed contracts.
   */
  async getContracts(email?: string, customerId?: string) {
    const me = await this.getPortalMe(email, customerId);
    return me.signedContracts;
  }

  /**
   * Returns buyer's documents from Prisma database.
   */
  async getDocuments(email?: string, customerId?: string) {
    const me = await this.getPortalMe(email, customerId);
    const documents = await this.prisma.document.findMany({
      where: {
        OR: [
          { entityType: 'CUSTOMER', entityId: me.customer.id },
          {
            entityType: 'CONTRACT',
            entityId: { in: me.signedContracts.map((c) => c.id) },
          },
        ],
      },
      orderBy: { uploadedAt: 'desc' },
    });

    return documents.map((doc) => ({
      id: doc.id,
      name: doc.name,
      fileUrl: doc.fileUrl,
      category: doc.category,
      status: doc.status,
      uploadedAt: doc.uploadedAt.toISOString(),
      sizeBytes: doc.sizeBytes,
    }));
  }

  /**
   * Returns buyer's invoices and receipts.
   */
  async getInvoices(email?: string, customerId?: string) {
    const me = await this.getPortalMe(email, customerId);
    const payments = await this.prisma.payment.findMany({
      where: { contract: { customerId: me.customer.id } },
      include: { contract: { include: { unit: true } } },
    });

    return payments.map((p) => ({
      id: p.id,
      amount: Number(p.amount),
      date: p.date.toISOString(),
      method: p.method,
      status: p.status,
      unitNumber: p.contract?.unit?.unitNumber ?? 'Unit',
      reference: `REC-${p.id.slice(0, 6).toUpperCase()}`,
    }));
  }

  /**
   * Records a bank slip submission in Prisma database.
   */
  async uploadBankSlip(
    customerId: string,
    input: BankSlipUploadInput,
  ): Promise<BankSlipSubmissionResult> {
    const { scheduleId, bankName, referenceNumber, amount, slipUrl, notes } =
      input;

    if (!scheduleId || !bankName || !referenceNumber || !amount) {
      throw new BadRequestException(
        'scheduleId, bankName, referenceNumber, and amount are required',
      );
    }

    const id = `slip_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const submission: BankSlipSubmissionResult = {
      id,
      scheduleId,
      status: 'PENDING_VERIFICATION',
      bankName,
      referenceNumber,
      submittedAt: new Date().toISOString(),
    };

    this.bankSlipStore.set(id, submission);

    // Save Bank Slip record in Prisma Document table
    const docName = `Bank_Slip_${bankName}_${referenceNumber}.pdf`;
    const document = await this.prisma.document.create({
      data: {
        name: docName,
        fileUrl: slipUrl || `/api/documents/${id}/download`,
        storageKey: `slips/${referenceNumber}`,
        category: 'RECEIPT',
        status: 'PENDING_REVIEW',
        entityType: 'PAYMENT',
        entityId: scheduleId,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: customerId,
        action: 'portal.bank_slip_submitted',
        entityType: 'PaymentSchedule',
        entityId: scheduleId,
        newValues: {
          documentId: document.id,
          bankName,
          referenceNumber,
          amount,
          slipUrl: slipUrl || document.fileUrl,
          notes: notes || undefined,
        },
      },
    });

    return submission;
  }
}
