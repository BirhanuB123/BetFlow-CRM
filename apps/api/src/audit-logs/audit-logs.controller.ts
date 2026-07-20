import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AuditLog, InMemoryService } from '../database/in-memory.service';

type CreateAuditLogBody = Omit<AuditLog, 'id' | 'createdAt'>;

@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly store: InMemoryService) {}

  @Get()
  list() {
    return this.store.listAuditLogs();
  }

  @Post()
  create(@Body() body: CreateAuditLogBody) {
    return this.store.recordAudit(body);
  }
}
