import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateContractInput, UpdateContractInput } from './contracts.types';
import { PdfGeneratorService } from './pdf-generator.service';

import { DocumentStorageService } from '../../platform/documents/document-storage.service';

const contractInclude = {
  customer: { select: { id: true, firstName: true, lastName: true } },
  unit: { select: { id: true, unitNumber: true, type: true, status: true } },
  deal: { select: { id: true, name: true } },
  _count: { select: { payments: true, schedules: true } },
} as const;

@Injectable()
export class ContractsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfGenerator: PdfGeneratorService,
    private readonly storage: DocumentStorageService,
  ) {}

  async generatePdf(id: string): Promise<Buffer> {
    const contract = await this.prisma.contract.findUnique({
      where: { id },
      include: {
        customer: true,
        unit: {
          include: {
            floor: {
              include: { building: { include: { project: true } } },
            },
          },
        },
        signatures: {
          orderBy: { signedAt: 'asc' },
        },
      },
    });

    if (!contract) {
      throw new NotFoundException(`Contract ${id} not found`);
    }

    const pdfBuffer = await this.pdfGenerator.generateContractPdf({
      contractId: contract.id,
      contractNumber: contract.contractNumber || undefined,
      projectName: contract.unit.floor.building.project.name,
      buildingName: contract.unit.floor.building.name,
      unitNumber: contract.unit.unitNumber,
      unitType: contract.unit.type,
      floorName:
        contract.unit.floor.name || `Floor ${contract.unit.floor.floorNumber}`,
      buyerName: `${contract.customer.firstName} ${contract.customer.lastName}`,
      buyerEmail: contract.customer.email || undefined,
      buyerPhone: contract.customer.phone || undefined,
      agreedPrice: Number(contract.totalAmt),
      currency: 'ETB',
      status: contract.status,
      createdAt: contract.createdAt,
      signatures: contract.signatures,
    });

    // Save PDF file to storage and register Document in PostgreSQL database via Prisma
    try {
      const fileName = `Contract_${contract.contractNumber || contract.id}.pdf`;
      const stored = await this.storage.save({
        originalname: fileName,
        mimetype: 'application/pdf',
        size: pdfBuffer.length,
        buffer: pdfBuffer,
      });

      const existingDoc = await this.prisma.document.findFirst({
        where: { entityType: 'CONTRACT', entityId: id },
      });

      if (existingDoc) {
        await this.prisma.document.update({
          where: { id: existingDoc.id },
          data: {
            name: fileName,
            fileUrl: `/api/documents/${existingDoc.id}/download`,
            storageKey: stored.storageKey,
            sizeBytes: pdfBuffer.length,
            checksum: stored.checksum,
            status:
              contract.status === 'SIGNED' ? 'VERIFIED' : 'PENDING_REVIEW',
          },
        });
      } else {
        const newDoc = await this.prisma.document.create({
          data: {
            name: fileName,
            fileUrl: '',
            storageKey: stored.storageKey,
            mimeType: 'application/pdf',
            sizeBytes: pdfBuffer.length,
            checksum: stored.checksum,
            category: 'CONTRACT',
            status:
              contract.status === 'SIGNED' ? 'VERIFIED' : 'PENDING_REVIEW',
            entityType: 'CONTRACT',
            entityId: id,
          },
        });
        await this.prisma.document.update({
          where: { id: newDoc.id },
          data: { fileUrl: `/api/documents/${newDoc.id}/download` },
        });
      }
    } catch {
      // Storage logging optional fallback
    }

    return pdfBuffer;
  }

  async signContract(
    id: string,
    input: {
      signerName: string;
      signerEmail?: string;
      signerRole: 'BUYER' | 'SELLER_REP' | 'WITNESS';
      signatureDataUrl: string;
    },
    reqMeta: { ipAddress: string; userAgent: string },
  ) {
    const contract = await this.prisma.contract.findUnique({
      where: { id },
    });

    if (!contract) {
      throw new NotFoundException(`Contract ${id} not found`);
    }

    const signedAtISO = new Date().toISOString();
    const verificationHash = this.pdfGenerator.computeSignatureHash(
      id,
      input.signerName,
      signedAtISO,
      reqMeta.ipAddress,
      input.signatureDataUrl,
    );

    const signature = await this.prisma.signatureAudit.create({
      data: {
        contractId: id,
        signerName: input.signerName,
        signerEmail: input.signerEmail || null,
        signerRole: input.signerRole,
        signatureDataUrl: input.signatureDataUrl,
        ipAddress: reqMeta.ipAddress,
        userAgent: reqMeta.userAgent,
        verificationHash,
        signedAt: new Date(signedAtISO),
      },
    });

    // Check if all designated required roles (BUYER and SELLER_REP) have submitted signatures
    const requiredRoles = ['BUYER', 'SELLER_REP'];
    const existingSignatures = await this.prisma.signatureAudit.findMany({
      where: { contractId: id },
    });
    const signedRoles = new Set(
      existingSignatures.map((s: { signerRole: string }) => s.signerRole),
    );

    const isFullySigned = requiredRoles.every((role) => signedRoles.has(role));

    if (isFullySigned) {
      // Mark contract as SIGNED and unit as SOLD only when all required signatures are present
      await this.prisma.contract.update({
        where: { id },
        data: { status: 'SIGNED' },
      });

      await this.prisma.unit.update({
        where: { id: contract.unitId },
        data: { status: 'SOLD' },
      });
    } else {
      // Retain or set status to PENDING_SIGNATURE until all signatures are complete
      await this.prisma.contract.update({
        where: { id },
        data: { status: 'PENDING_SIGNATURE' },
      });
    }

    return signature;
  }

  async getSignatures(id: string) {
    return this.prisma.signatureAudit.findMany({
      where: { contractId: id },
      orderBy: { signedAt: 'asc' },
    });
  }

  async list() {
    return this.prisma.contract.findMany({
      where: {},
      include: contractInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  private async deduplicateUnitContracts() {
    // Find all active or signed contracts grouped by unitId
    const activeContracts = await this.prisma.contract.findMany({
      where: {
        status: {
          in: ['ACTIVE', 'SIGNED', 'PENDING_SIGNATURE', 'PENDING_APPROVAL'],
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const seenUnits = new Set<string>();
    const duplicateIdsToCancel: string[] = [];

    for (const contract of activeContracts) {
      if (seenUnits.has(contract.unitId)) {
        duplicateIdsToCancel.push(contract.id);
      } else {
        seenUnits.add(contract.unitId);
      }
    }

    if (duplicateIdsToCancel.length > 0) {
      await this.prisma.contract.updateMany({
        where: { id: { in: duplicateIdsToCancel } },
        data: { status: 'CANCELLED' },
      });
    }
  }

  async get(id: string) {
    const contract = await this.prisma.contract.findFirst({
      where: { id },
      include: contractInclude,
    });

    if (!contract) {
      throw new NotFoundException(`Contract ${id} was not found`);
    }

    return contract;
  }

  async create(userId: string, input: CreateContractInput) {
    if (!input.customerId)
      throw new BadRequestException('customerId is required');
    if (!input.unitId) throw new BadRequestException('unitId is required');

    const startDate = this.normalizeDate(input.startDate, 'startDate');
    const endDate =
      input.endDate != null && input.endDate !== ''
        ? this.normalizeDate(input.endDate, 'endDate')
        : null;
    if (endDate && endDate < startDate) {
      throw new BadRequestException('endDate cannot be before startDate');
    }

    const totalAmt = this.normalizeAmount(input.totalAmt);
    const downPaymentAmt =
      input.downPaymentAmt != null && input.downPaymentAmt !== ''
        ? this.normalizeAmount(input.downPaymentAmt)
        : null;

    const contractNumber =
      input.contractNumber?.trim() ||
      `ET-CNT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    await this.assertCustomerExists(input.customerId);
    await this.assertUnitExists(input.unitId);
    if (input.dealId) {
      await this.assertDealExists(input.dealId);
    }

    const initialStatus = input.status?.trim() || 'ACTIVE';
    const targetUnitStatus = initialStatus === 'SIGNED' ? 'SOLD' : 'RESERVED';

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Prevent duplicate active/signed contracts for the same unit inside transaction
      const existingActiveContract = await tx.contract.findFirst({
        where: {
          unitId: input.unitId,
          status: {
            in: ['ACTIVE', 'SIGNED', 'PENDING_SIGNATURE', 'PENDING_APPROVAL'],
          },
        },
      });

      if (existingActiveContract) {
        throw new BadRequestException(
          `Unit already has an active contract (${existingActiveContract.contractNumber || existingActiveContract.id}). Duplicate contracts for the same unit are not allowed.`,
        );
      }

      // Atomic unit status lock to prevent concurrent double-booking
      const unitUpdateResult = await tx.unit.updateMany({
        where: {
          id: input.unitId,
          status: { not: 'SOLD' },
        },
        data: { status: targetUnitStatus },
      });

      if (unitUpdateResult.count === 0) {
        const unit = await tx.unit.findFirst({ where: { id: input.unitId } });
        throw new BadRequestException(
          `Unit ${unit?.unitNumber || input.unitId} is ${unit?.status.toLowerCase() || 'unavailable'} and cannot accept a new contract`,
        );
      }

      const contract = await tx.contract.create({
        data: {
          contractNumber,
          contractType: input.contractType || 'SALES_AGREEMENT',
          customerId: input.customerId,
          unitId: input.unitId,
          dealId: input.dealId || null,
          startDate,
          endDate,
          totalAmt,
          downPaymentAmt,
          paymentPlan: input.paymentPlan || 'INSTALLMENTS_24M',
          notes: input.notes?.trim() || null,
          status: initialStatus,
        },
        include: contractInclude,
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: 'contract.created',
          entityType: 'Contract',
          entityId: contract.id,
        },
      });

      if (input.reservationId) {
        const reservation = await tx.reservation.findFirst({
          where: { id: input.reservationId },
        });

        if (reservation) {
          await tx.reservation.update({
            where: { id: input.reservationId },
            data: { status: 'CONVERTED_TO_CONTRACT' },
          });

          await tx.auditLog.create({
            data: {
              userId,
              action: 'reservation.converted_to_contract',
              entityType: 'Reservation',
              entityId: input.reservationId,
              newValues: {
                contractId: contract.id,
                status: 'CONVERTED_TO_CONTRACT',
              },
            },
          });
        }
      }

      return contract;
    });
  }

  async update(userId: string, id: string, input: UpdateContractInput) {
    const existing = await this.prisma.contract.findFirst({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Contract ${id} was not found`);
    }

    if (input.customerId) {
      await this.assertCustomerExists(input.customerId);
    }
    if (input.unitId) {
      await this.assertUnitExists(input.unitId);
    }
    if (input.dealId) {
      await this.assertDealExists(input.dealId);
    }

    const data: Record<string, unknown> = {};
    if (input.contractNumber !== undefined)
      data.contractNumber = input.contractNumber?.trim() || null;
    if (input.contractType !== undefined)
      data.contractType = input.contractType;
    if (input.customerId !== undefined) data.customerId = input.customerId;
    if (input.unitId !== undefined) data.unitId = input.unitId;
    if (input.dealId !== undefined) data.dealId = input.dealId || null;
    if (input.startDate !== undefined)
      data.startDate = this.normalizeDate(input.startDate, 'startDate');
    if (input.endDate !== undefined)
      data.endDate =
        input.endDate != null && input.endDate !== ''
          ? this.normalizeDate(input.endDate, 'endDate')
          : null;
    if (input.totalAmt !== undefined)
      data.totalAmt = this.normalizeAmount(input.totalAmt);
    if (input.downPaymentAmt !== undefined)
      data.downPaymentAmt =
        input.downPaymentAmt != null && input.downPaymentAmt !== ''
          ? this.normalizeAmount(input.downPaymentAmt)
          : null;
    if (input.paymentPlan !== undefined)
      data.paymentPlan = input.paymentPlan || null;
    if (input.notes !== undefined) data.notes = input.notes?.trim() || null;
    if (input.status !== undefined) {
      const status = input.status.trim();
      if (!status) throw new BadRequestException('status cannot be empty');
      data.status = status;
    }

    // Signing a contract marks the unit as SOLD in the same transaction.
    const becomesSigned =
      typeof data.status === 'string' &&
      data.status.toUpperCase() === 'SIGNED' &&
      existing.status.toUpperCase() !== 'SIGNED';

    if (becomesSigned) {
      const unitId = (data.unitId as string | undefined) ?? existing.unitId;

      return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const contract = await tx.contract.update({
          where: { id },
          data,
          include: contractInclude,
        });

        await tx.unit.update({
          where: { id: unitId },
          data: { status: 'SOLD' },
        });

        await tx.auditLog.create({
          data: {
            userId,
            action: 'contract.signed',
            entityType: 'Contract',
            entityId: contract.id,
            newValues: { unitStatus: 'SOLD' },
          },
        });

        return {
          ...contract,
          unit: { ...contract.unit, status: 'SOLD' },
        };
      });
    }

    const contract = await this.prisma.contract.update({
      where: { id },
      data,
      include: contractInclude,
    });

    await this.recordAudit(userId, 'contract.updated', contract.id);

    return contract;
  }

  async remove(userId: string, id: string) {
    const existing = await this.prisma.contract.findFirst({
      where: { id },
      include: { _count: { select: { payments: true, schedules: true } } },
    });

    if (!existing) {
      throw new NotFoundException(`Contract ${id} was not found`);
    }

    if (existing._count.payments > 0 || existing._count.schedules > 0) {
      throw new BadRequestException(
        'Cannot delete a contract with linked payments or schedules',
      );
    }

    await this.prisma.contract.delete({ where: { id } });
    await this.recordAudit(userId, 'contract.deleted', id);

    return { id, deleted: true };
  }

  private normalizeAmount(value: number | string): string {
    const parsed = typeof value === 'string' ? Number(value) : value;

    if (value === undefined || value === null || Number.isNaN(parsed)) {
      throw new BadRequestException('totalAmt must be a valid number');
    }
    if (parsed < 0) {
      throw new BadRequestException('totalAmt cannot be negative');
    }

    return parsed.toFixed(2);
  }

  private normalizeDate(value: string, field: string): Date {
    const date = new Date(value);
    if (!value || Number.isNaN(date.getTime())) {
      throw new BadRequestException(`${field} must be a valid date`);
    }
    return date;
  }

  private async assertCustomerExists(customerId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id: customerId },
    });
    if (!customer) {
      throw new BadRequestException(`Customer ${customerId} was not found`);
    }
  }

  private async assertUnitExists(unitId: string) {
    const unit = await this.prisma.unit.findFirst({
      where: { id: unitId },
    });
    if (!unit) {
      throw new BadRequestException(`Unit ${unitId} was not found`);
    }
  }

  private async assertDealExists(dealId: string) {
    const deal = await this.prisma.deal.findFirst({
      where: { id: dealId },
    });
    if (!deal) {
      throw new BadRequestException(`Deal ${dealId} was not found`);
    }
  }

  private recordAudit(userId: string, action: string, entityId: string) {
    return this.prisma.auditLog.create({
      data: { userId, action, entityType: 'Contract', entityId },
    });
  }
}
