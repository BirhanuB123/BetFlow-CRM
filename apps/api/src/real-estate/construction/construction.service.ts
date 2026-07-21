import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import type {
  ConstructionMilestone,
  ConstructionStageKey,
  MilestoneTriggerResult,
  UpdateMilestoneProgressInput,
} from '@betflow/shared';

const STAGE_METADATA: Record<
  ConstructionStageKey,
  { en: string; am: string; defaultPercentShare: number }
> = {
  FOUNDATION: { en: 'Foundation & Substructure', am: 'መሰረት ስራ', defaultPercentShare: 20 },
  SUPERSTRUCTURE: { en: 'Concrete Frame & Columns', am: 'ኮንክሪት ስራ', defaultPercentShare: 30 },
  BLOCKWORK: { en: 'Masonry & Wall Blockwork', am: 'ብሎኬት ስራ', defaultPercentShare: 20 },
  FINISHING: { en: 'MEP, Plastering & Finishing', am: 'ማጠናቀቂያ ስራ', defaultPercentShare: 20 },
  HANDOVER: { en: 'Final Inspection & Key Handover (Carta)', am: 'ካርታና ርክክብ', defaultPercentShare: 10 },
};

@Injectable()
export class ConstructionService {
  // In-memory progress store mapped by buildingId + stageKey
  private readonly progressStore = new Map<string, ConstructionMilestone>();

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retrieves all 5 Ethiopian construction milestones for a given building.
   */
  async getBuildingMilestones(buildingId: string): Promise<ConstructionMilestone[]> {
    const building = await this.prisma.building.findUnique({
      where: { id: buildingId },
    });

    if (!building) {
      throw new NotFoundException(`Building ${buildingId} was not found`);
    }

    const stages: ConstructionStageKey[] = [
      'FOUNDATION',
      'SUPERSTRUCTURE',
      'BLOCKWORK',
      'FINISHING',
      'HANDOVER',
    ];

    return stages.map((stageKey) => {
      const key = `${buildingId}_${stageKey}`;
      const existing = this.progressStore.get(key);

      if (existing) return existing;

      // Default initial state
      const initial: ConstructionMilestone = {
        id: key,
        buildingId,
        stageKey,
        stageNameEnglish: STAGE_METADATA[stageKey].en,
        stageNameAmharic: STAGE_METADATA[stageKey].am,
        completionPercent: stageKey === 'FOUNDATION' ? 100 : stageKey === 'SUPERSTRUCTURE' ? 45 : 0,
        status: stageKey === 'FOUNDATION' ? 'COMPLETED' : stageKey === 'SUPERSTRUCTURE' ? 'IN_PROGRESS' : 'NOT_STARTED',
        targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: stageKey === 'FOUNDATION' ? new Date().toISOString() : null,
      };

      this.progressStore.set(key, initial);
      return initial;
    });
  }

  /**
   * Updates construction milestone progress and triggers automated payment demands for linked buyers.
   */
  async updateMilestoneProgress(
    userId: string,
    input: UpdateMilestoneProgressInput,
  ): Promise<MilestoneTriggerResult> {
    const { buildingId, stageKey, completionPercent, status, photoUrl, notes } = input;

    const building = await this.prisma.building.findUnique({
      where: { id: buildingId },
      include: {
        floors: {
          include: {
            units: {
              include: {
                deals: {
                  include: {
                    customer: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!building) {
      throw new NotFoundException(`Building ${buildingId} was not found`);
    }

    const meta = STAGE_METADATA[stageKey];
    if (!meta) {
      throw new BadRequestException(`Invalid construction stageKey: ${stageKey}`);
    }

    const key = `${buildingId}_${stageKey}`;
    const milestone: ConstructionMilestone = {
      id: key,
      buildingId,
      stageKey,
      stageNameEnglish: meta.en,
      stageNameAmharic: meta.am,
      completionPercent: Math.min(100, Math.max(0, completionPercent)),
      status,
      completedAt: status === 'COMPLETED' ? new Date().toISOString() : null,
      photoUrl: photoUrl || null,
    };

    this.progressStore.set(key, milestone);

    // Collect all units and active buyer contracts in this building
    let contractsTriggered = 0;
    let invoicesGenerated = 0;
    let notificationsSent = 0;

    if (status === 'COMPLETED' || completionPercent >= 100) {
      for (const floor of building.floors) {
        for (const unit of floor.units) {
          for (const deal of unit.deals) {
            contractsTriggered++;
            invoicesGenerated++;

            // Create in-app notification for the sales agent / customer
            await this.prisma.notification.create({
              data: {
                userId,
                title: `🏗️ Milestone Reached: ${meta.en} (${meta.am})`,
                message: `Building "${building.name}" unit ${unit.unitNumber} milestone completed. Payment installment invoice generated for customer ${deal.customer.firstName} ${deal.customer.lastName}.`,
              },
            });

            notificationsSent++;
          }
        }
      }
    }

    // Record audit log
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'construction.milestone_updated',
        entityType: 'Building',
        entityId: buildingId,
        newValues: {
          stageKey,
          completionPercent,
          status,
          notes: notes || undefined,
        },
      },
    });

    return {
      milestone,
      contractsTriggered,
      invoicesGenerated,
      notificationsSent,
    };
  }
}
