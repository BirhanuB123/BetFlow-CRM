import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import type { AuthenticatedUser } from '../../core/auth/auth.types';
import {
  DocumentStorageService,
  type IncomingDocumentFile,
} from './document-storage.service';

const DOCUMENT_CATEGORIES = [
  'KEBELE_ID',
  'PASSPORT',
  'TIN_CERTIFICATE',
  'YELLOW_CARD',
  'FOREIGN_PASSPORT',
  'POWER_OF_ATTORNEY_MOFA',
  'ID',
  'KYC',
  'CONTRACT',
  'RECEIPT',
  'TITLE_DEED',
  'FLOOR_PLAN',
  'OTHER',
] as const;
const DOCUMENT_STATUSES = [
  'PENDING_REVIEW',
  'VERIFIED',
  'REJECTED',
  'EXPIRED',
] as const;
const ENTITY_TYPES = [
  'ACCOUNT',
  'CUSTOMER',
  'LEAD',
  'DEAL',
  'SITE_VISIT',
  'RESERVATION',
  'CONTRACT',
  'PAYMENT',
  'PROJECT',
  'UNIT',
] as const;

type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number];
type DocumentStatus = (typeof DOCUMENT_STATUSES)[number];
type EntityType = (typeof ENTITY_TYPES)[number];

export type CreateDocumentBody = {
  category?: string;
  entityType?: string;
  entityId?: string;
  expiresAt?: string;
};

export type ReviewDocumentBody = {
  status?: string;
  rejectionReason?: string;
};

export type DocumentFilters = {
  entityType?: string;
  entityId?: string;
  category?: string;
  status?: string;
};

const documentInclude = {
  uploadedBy: { select: { id: true, firstName: true, lastName: true } },
  reviewedBy: { select: { id: true, firstName: true, lastName: true } },
} as const;

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: DocumentStorageService,
  ) {}

  async list(filters: DocumentFilters = {}) {
    const where: Record<string, unknown> = {};
    if (filters.entityType)
      where.entityType = this.normalizeEntityType(filters.entityType);
    if (filters.entityId) where.entityId = filters.entityId;
    if (filters.category)
      where.category = this.normalizeCategory(filters.category);
    if (filters.status) where.status = this.normalizeStatus(filters.status);

    const documents = await this.prisma.document.findMany({
      where,
      include: documentInclude,
      orderBy: { uploadedAt: 'desc' },
    });
    return documents.map((document) => this.serialize(document));
  }

  async getKycStatus(customerId: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        email: true,
      },
    });
    if (!customer)
      throw new NotFoundException(`Customer ${customerId} not found`);

    const isDiaspora =
      !!customer.phone &&
      customer.phone.startsWith('+') &&
      !customer.phone.startsWith('+251');

    const requiredPreset = isDiaspora
      ? [
          {
            category: 'YELLOW_CARD',
            label: 'Yellow Card (Ethiopian Origin ID)',
          },
          { category: 'FOREIGN_PASSPORT', label: 'Foreign Passport' },
          {
            category: 'POWER_OF_ATTORNEY_MOFA',
            label: 'Power of Attorney (ውክልና MoFA Verified)',
          },
        ]
      : [
          { category: 'KEBELE_ID', label: 'Kebele / Resident ID' },
          { category: 'PASSPORT', label: 'Ethiopian National Passport' },
          {
            category: 'TIN_CERTIFICATE',
            label: 'TIN Certificate (Taxpayer ID)',
          },
        ];

    const customerDocuments = await this.prisma.document.findMany({
      where: { entityType: 'CUSTOMER', entityId: customerId },
      include: documentInclude,
    });

    const now = new Date();
    const requirements = requiredPreset.map((req) => {
      const doc = customerDocuments.find(
        (d) => d.category.toUpperCase() === req.category,
      );

      let status: 'VERIFIED' | 'PENDING_REVIEW' | 'EXPIRED' | 'MISSING' =
        'MISSING';
      if (doc) {
        if (doc.expiresAt && doc.expiresAt < now) {
          status = 'EXPIRED';
        } else if (doc.status === 'VERIFIED') {
          status = 'VERIFIED';
        } else {
          status = 'PENDING_REVIEW';
        }
      }

      return {
        category: req.category,
        label: req.label,
        status,
        document: doc ? this.serialize(doc) : null,
      };
    });

    const verifiedCount = requirements.filter(
      (r) => r.status === 'VERIFIED',
    ).length;
    const completionPercentage = Math.round(
      (verifiedCount / requirements.length) * 100,
    );
    const isKycComplete = verifiedCount === requirements.length;

    return {
      customerId: customer.id,
      customerName: `${customer.firstName} ${customer.lastName}`,
      buyerType: isDiaspora ? 'DIASPORA' : 'LOCAL',
      isKycComplete,
      completionPercentage,
      verifiedCount,
      totalRequired: requirements.length,
      requirements,
    };
  }

  async getContractDocumentStatus(contractId: string) {
    const contract = await this.prisma.contract.findFirst({
      where: { id: contractId },
      include: {
        customer: true,
        unit: true,
        signatures: true,
      },
    });

    if (!contract) {
      throw new NotFoundException(`Contract ${contractId} was not found`);
    }

    const requiredPreset = [
      {
        category: 'CONTRACT',
        label: 'Signed Sales Contract (የሽያጭ ውል)',
      },
      {
        category: 'RECEIPT',
        label: 'Down Payment Bank Receipt (የቅድመ ክፍያ ደረሰኝ)',
      },
      {
        category: 'ID',
        label: 'Buyer ID / Kebele / Passport Copy (የመታወቂያ ኮፒ)',
      },
      {
        category: 'FLOOR_PLAN',
        label: 'Unit Floor Plan & Architectural Annex (የፕላን አባሪ)',
      },
    ];

    const [contractDocs, customerDocs, unitDocs] = await Promise.all([
      this.prisma.document.findMany({
        where: { entityType: 'CONTRACT', entityId: contractId },
        include: documentInclude,
      }),
      this.prisma.document.findMany({
        where: { entityType: 'CUSTOMER', entityId: contract.customerId },
        include: documentInclude,
      }),
      this.prisma.document.findMany({
        where: { entityType: 'UNIT', entityId: contract.unitId },
        include: documentInclude,
      }),
    ]);

    const allDocs = [...contractDocs, ...customerDocs, ...unitDocs];
    const now = new Date();

    const requirements = requiredPreset.map((req) => {
      let doc = allDocs.find((d) => {
        const cat = d.category.toUpperCase();
        if (req.category === 'ID') {
          return [
            'ID',
            'KEBELE_ID',
            'PASSPORT',
            'FOREIGN_PASSPORT',
            'YELLOW_CARD',
          ].includes(cat);
        }
        return cat === req.category;
      });

      let status: 'VERIFIED' | 'PENDING_REVIEW' | 'EXPIRED' | 'MISSING' =
        'MISSING';
      if (doc) {
        if (doc.expiresAt && doc.expiresAt < now) {
          status = 'EXPIRED';
        } else if (doc.status === 'VERIFIED') {
          status = 'VERIFIED';
        } else {
          status = 'PENDING_REVIEW';
        }
      } else if (
        req.category === 'CONTRACT' &&
        (contract.status === 'SIGNED' ||
          (contract.signatures && contract.signatures.length > 0))
      ) {
        status = 'VERIFIED';
      }

      return {
        category: req.category,
        label: req.label,
        status,
        document: doc ? this.serialize(doc) : null,
      };
    });

    const verifiedCount = requirements.filter(
      (r) => r.status === 'VERIFIED',
    ).length;
    const completionPercentage = Math.round(
      (verifiedCount / requirements.length) * 100,
    );
    const isComplete = verifiedCount === requirements.length;

    return {
      contractId: contract.id,
      contractNumber:
        contract.contractNumber || `CNT-${contract.id.slice(0, 8)}`,
      buyerName: `${contract.customer.firstName} ${contract.customer.lastName}`,
      unitNumber: contract.unit.unitNumber,
      isComplete,
      completionPercentage,
      verifiedCount,
      totalRequired: requirements.length,
      requirements,
    };
  }

  async upload(
    user: AuthenticatedUser,
    input: CreateDocumentBody,
    file: IncomingDocumentFile,
  ) {
    const category = this.normalizeCategory(input.category ?? 'OTHER');
    const entityType = this.normalizeEntityType(input.entityType ?? 'CUSTOMER');
    const entityId = input.entityId?.trim();
    if (!entityId) throw new BadRequestException('entityId is required');
    await this.assertEntityExists(entityType, entityId);
    const expiresAt = this.normalizeOptionalDate(input.expiresAt, 'expiresAt');

    const stored = await this.storage.save(file);
    try {
      const document = await this.prisma.document.create({
        data: {
          name: file.originalname,
          fileUrl: '',
          storageKey: stored.storageKey,
          mimeType: file.mimetype,
          sizeBytes: file.size,
          checksum: stored.checksum,
          category,
          status: 'PENDING_REVIEW',
          entityType,
          entityId,
          uploadedById: user.id,
          expiresAt,
        },
        include: documentInclude,
      });
      const updated = await this.prisma.document.update({
        where: { id: document.id },
        data: { fileUrl: `/api/documents/${document.id}/download` },
        include: documentInclude,
      });
      await this.recordAudit(user, 'document.uploaded', updated.id, {
        category,
        entityType,
        entityId,
        fileName: file.originalname,
      });
      return this.serialize(updated);
    } catch (error) {
      await this.storage.remove(stored.storageKey);
      throw error;
    }
  }

  async review(user: AuthenticatedUser, id: string, input: ReviewDocumentBody) {
    const existing = await this.findDocument(id);
    const status = this.normalizeStatus(input.status ?? 'PENDING_REVIEW');
    if (!['VERIFIED', 'REJECTED'].includes(status)) {
      throw new BadRequestException(
        'Review status must be VERIFIED or REJECTED',
      );
    }
    const rejectionReason = input.rejectionReason?.trim() || null;
    if (status === 'REJECTED' && !rejectionReason) {
      throw new BadRequestException('A rejection reason is required');
    }

    const document = await this.prisma.document.update({
      where: { id: existing.id },
      data: {
        status,
        reviewedById: user.id,
        reviewedAt: new Date(),
        rejectionReason: status === 'REJECTED' ? rejectionReason : null,
      },
      include: documentInclude,
    });
    await this.recordAudit(user, 'document.reviewed', id, {
      status,
      rejectionReason,
    });
    return this.serialize(document);
  }

  async download(id: string) {
    const document = await this.findDocument(id);
    if (!document.storageKey)
      throw new NotFoundException('Document file is unavailable');
    await this.storage.assertExists(document.storageKey);
    return { document, stream: this.storage.open(document.storageKey) };
  }

  async remove(user: AuthenticatedUser, id: string) {
    const document = await this.findDocument(id);
    const canManageAll = user.roles.some(
      (role: string) => role === 'Owner' || role === 'Admin',
    );
    if (!canManageAll && document.uploadedById !== user.id) {
      throw new ForbiddenException(
        'Only the uploader or an administrator can delete a document',
      );
    }
    await this.prisma.document.delete({ where: { id } });
    await this.storage.remove(document.storageKey);
    await this.recordAudit(user, 'document.deleted', id, {
      entityType: document.entityType,
      entityId: document.entityId,
      fileName: document.name,
    });
    return { id, deleted: true };
  }

  private async findDocument(id: string) {
    const document = await this.prisma.document.findFirst({
      where: { id },
      include: documentInclude,
    });
    if (!document) throw new NotFoundException(`Document ${id} was not found`);
    return document;
  }

  private async assertEntityExists(entityType: EntityType, entityId: string) {
    const where = { id: entityId };
    const entity = await {
      ACCOUNT: () => this.prisma.account.findFirst({ where }),
      CUSTOMER: () => this.prisma.customer.findFirst({ where }),
      LEAD: () => this.prisma.lead.findFirst({ where }),
      DEAL: () => this.prisma.deal.findFirst({ where }),
      SITE_VISIT: () => this.prisma.siteVisit.findFirst({ where }),
      RESERVATION: () => this.prisma.reservation.findFirst({ where }),
      CONTRACT: () => this.prisma.contract.findFirst({ where }),
      PAYMENT: () => this.prisma.payment.findFirst({ where }),
      PROJECT: () => this.prisma.project.findFirst({ where }),
      UNIT: () => this.prisma.unit.findFirst({ where }),
    }[entityType]();
    if (!entity)
      throw new BadRequestException(`${entityType} ${entityId} was not found`);
  }

  private normalizeCategory(value: string): DocumentCategory {
    return this.normalizeFromList(value, DOCUMENT_CATEGORIES, 'category');
  }

  private normalizeStatus(value: string): DocumentStatus {
    return this.normalizeFromList(value, DOCUMENT_STATUSES, 'status');
  }

  private normalizeEntityType(value: string): EntityType {
    return this.normalizeFromList(value, ENTITY_TYPES, 'entityType');
  }

  private normalizeFromList<T extends readonly string[]>(
    value: string,
    allowed: T,
    label: string,
  ): T[number] {
    const normalized = value
      .trim()
      .toUpperCase()
      .replace(/[\s-]+/g, '_');
    if (!allowed.includes(normalized)) {
      throw new BadRequestException(
        `${label} must be one of: ${allowed.join(', ')}`,
      );
    }
    return normalized;
  }

  private normalizeOptionalDate(value: string | undefined, label: string) {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime()))
      throw new BadRequestException(`${label} must be a valid date`);
    return date;
  }

  private serialize(document: any) {
    return {
      ...document,
      uploadedBy: document.uploadedBy
        ? {
            id: document.uploadedBy.id,
            name: `${document.uploadedBy.firstName} ${document.uploadedBy.lastName}`.trim(),
          }
        : null,
      reviewedBy: document.reviewedBy
        ? {
            id: document.reviewedBy.id,
            name: `${document.reviewedBy.firstName} ${document.reviewedBy.lastName}`.trim(),
          }
        : null,
    };
  }

  private recordAudit(
    user: AuthenticatedUser,
    action: string,
    entityId: string,
    newValues: Record<string, string | null>,
  ) {
    return this.prisma.auditLog.create({
      data: {
        userId: user.id,
        action,
        entityType: 'Document',
        entityId,
        newValues: newValues,
      },
    });
  }
}
