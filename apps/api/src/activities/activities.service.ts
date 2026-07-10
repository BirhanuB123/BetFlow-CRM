import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

// The activity timeline is derived from the audit log, which every module
// already writes to on create/update/status changes. This keeps a single
// source of truth instead of double-writing a separate Activity table.

const ACTION_LABELS: Record<string, string> = {
  'auth.login': 'Signed in',
  'lead.created': 'Lead created',
  'lead.updated': 'Lead updated',
  'lead.status_changed': 'Lead status changed',
  'lead.converted': 'Lead converted',
  'lead.deleted': 'Lead deleted',
  'customer.created': 'Customer created',
  'customer.updated': 'Customer updated',
  'customer.deleted': 'Customer deleted',
  'deal.created': 'Deal created',
  'deal.updated': 'Deal updated',
  'deal.stage_changed': 'Deal moved stage',
  'deal.deleted': 'Deal deleted',
  'unit.created': 'Unit created',
  'unit.updated': 'Unit updated',
  'unit.status_changed': 'Unit status changed',
  'unit.deleted': 'Unit deleted',
  'reservation.created': 'Reservation created',
  'reservation.updated': 'Reservation updated',
  'reservation.status_changed': 'Reservation status changed',
  'reservation.deleted': 'Reservation deleted',
  'contract.created': 'Contract created',
  'contract.updated': 'Contract updated',
  'contract.signed': 'Contract signed',
  'contract.deleted': 'Contract deleted',
  'payment.created': 'Payment recorded',
  'payment.updated': 'Payment updated',
  'payment.deleted': 'Payment deleted',
  'note.created': 'Note added',
  'note.deleted': 'Note deleted',
  'account.created': 'Account created',
  'account.updated': 'Account updated',
  'account.deleted': 'Account deleted',
  'project.created': 'Project created',
  'project.updated': 'Project updated',
  'project.deleted': 'Project deleted',
  'building.created': 'Building added',
  'building.updated': 'Building updated',
  'building.deleted': 'Building removed',
  'floor.created': 'Floor added',
  'floor.updated': 'Floor updated',
  'floor.deleted': 'Floor removed',
  'tenant.registered': 'Workspace created',
  'tenant.updated': 'Workspace settings updated',
  'demo.seeded': 'Demo data seeded',
};

type ListOptions = {
  entityType?: string;
  entityId?: string;
  limit?: number;
};

@Injectable()
export class ActivitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string, options: ListOptions = {}) {
    const take = Math.min(Math.max(options.limit ?? 50, 1), 200);

    const logs = await this.prisma.auditLog.findMany({
      where: {
        tenantId,
        ...(options.entityType ? { entityType: options.entityType } : {}),
        ...(options.entityId ? { entityId: options.entityId } : {}),
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
      take,
    });

    return logs.map((log) => ({
      id: log.id,
      action: log.action,
      label: this.labelFor(log.action),
      detail: this.detailFor(log.newValues),
      entityType: log.entityType,
      entityId: log.entityId,
      actor: log.user
        ? `${log.user.firstName} ${log.user.lastName}`.trim()
        : 'System',
      createdAt: log.createdAt,
    }));
  }

  private labelFor(action: string): string {
    if (ACTION_LABELS[action]) return ACTION_LABELS[action];
    // Fallback: "some.action_name" -> "Some action name"
    const words = action.replace(/[._]/g, ' ').trim();
    return words.charAt(0).toUpperCase() + words.slice(1);
  }

  private detailFor(newValues: unknown): string | null {
    if (!newValues || typeof newValues !== 'object') return null;
    const values = newValues as Record<string, unknown>;

    if (typeof values.preview === 'string') {
      return `“${values.preview}”`;
    }
    if (typeof values.from === 'string' && typeof values.to === 'string') {
      const suffix =
        typeof values.unitStatus === 'string' ? ` · unit ${values.unitStatus}` : '';
      return `${values.from} → ${values.to}${suffix}`;
    }
    if (typeof values.unitStatus === 'string') {
      return `Unit ${values.unitStatus}`;
    }
    return null;
  }
}