import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateNoteInput } from './notes.types';

const noteInclude = {
  author: { select: { id: true, firstName: true, lastName: true } },
} as const;

@Injectable()
export class NotesService {
  constructor(private readonly prisma: PrismaService) {}

  list(filters: { entityType?: string; entityId?: string } = {}) {
    return this.prisma.note.findMany({
      where: {
        ...(filters.entityType ? { entityType: filters.entityType } : {}),
        ...(filters.entityId ? { entityId: filters.entityId } : {}),
      },
      include: noteInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(userId: string, input: CreateNoteInput) {
    const content = input.content?.trim();
    if (!content) throw new BadRequestException('content is required');
    if (!input.entityType)
      throw new BadRequestException('entityType is required');
    if (!input.entityId) throw new BadRequestException('entityId is required');

    const note = await this.prisma.note.create({
      data: {
        content,
        authorId: userId,
        entityType: input.entityType,
        entityId: input.entityId,
      },
      include: noteInclude,
    });

    // Surface the note on the entity's activity timeline (audit-log backed).
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'note.created',
        entityType: input.entityType,
        entityId: input.entityId,
        newValues: { preview: content.slice(0, 120) },
      },
    });

    return note;
  }

  async remove(userId: string, id: string) {
    const existing = await this.prisma.note.findFirst({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Note ${id} was not found`);
    }
    if (existing.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own notes');
    }

    await this.prisma.note.delete({ where: { id } });
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'note.deleted',
        entityType: existing.entityType,
        entityId: existing.entityId,
      },
    });

    return { id, deleted: true };
  }
}
