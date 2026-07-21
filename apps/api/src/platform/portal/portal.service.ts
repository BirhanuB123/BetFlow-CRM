import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../database/prisma.service';
import type {
  BankSlipUploadInput,
  BankSlipSubmissionResult,
  PortalAuthResponse,
} from '@betflow/shared';

@Injectable()
export class PortalService {
  // Store bank slip verification submissions
  private readonly bankSlipStore = new Map<string, BankSlipSubmissionResult>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Authenticates a buyer using their registered Email or Phone.
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
      throw new NotFoundException(`Customer matching '${clean}' was not found in CRM`);
    }

    const token = this.jwtService.sign(
      {
        sub: customer.id,
        email: customer.email ?? '',
        roles: ['Customer'],
      },
      { expiresIn: '30d' },
    );

    return {
      accessToken: token,
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
   * Fetches buyer's active contracts, unit details, and payment schedules.
   */
  async getMyContracts(customerId: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        contracts: {
          include: {
            deal: {
              include: {
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
              },
            },
            paymentSchedules: {
              orderBy: { dueDate: 'asc' },
            },
          },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException(`Buyer ${customerId} not found`);
    }

    return customer.contracts.map((c) => ({
      id: c.id,
      title: c.title,
      status: c.status,
      totalAmt: c.totalAmt,
      signedAt: c.signedAt,
      unit: c.deal?.unit
        ? {
            id: c.deal.unit.id,
            unitNumber: c.deal.unit.unitNumber,
            type: c.deal.unit.type,
            buildingName: c.deal.unit.floor.building.name,
            projectName: c.deal.unit.floor.building.project.name,
          }
        : null,
      paymentSchedules: c.paymentSchedules,
    }));
  }

  /**
   * Fetches all payment schedules for buyer's contracts.
   */
  async getMyPaymentSchedules(customerId: string) {
    const contracts = await this.getMyContracts(customerId);
    const schedules = contracts.flatMap((c) => c.paymentSchedules);
    return schedules;
  }

  /**
   * Processes a bank transfer receipt slip upload from Diaspora or local buyers.
   */
  async uploadBankSlip(
    customerId: string,
    input: BankSlipUploadInput,
  ): Promise<BankSlipSubmissionResult> {
    const { scheduleId, bankName, referenceNumber, amount, slipUrl, notes } = input;

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

    // Notify Finance team of bank slip submission
    const customer = await this.prisma.customer.findUnique({ where: { id: customerId } });

    await this.prisma.notification.create({
      data: {
        userId: customerId,
        title: `🧾 Bank Slip Submitted for Verification`,
        message: `Buyer ${customer?.firstName} ${customer?.lastName} submitted a bank transfer slip (${bankName} Ref: ${referenceNumber}) for ${amount.toLocaleString()} ETB. Pending Finance Verification.`,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: customerId,
        action: 'portal.bank_slip_submitted',
        entityType: 'PaymentSchedule',
        entityId: scheduleId,
        newValues: {
          bankName,
          referenceNumber,
          amount,
          slipUrl: slipUrl || undefined,
          notes: notes || undefined,
        },
      },
    });

    return submission;
  }
}
