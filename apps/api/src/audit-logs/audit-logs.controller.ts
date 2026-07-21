import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { Prisma } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly auditLogs: AuditLogsService) {}

  @Get()
  list() {
    return this.auditLogs.list();
  }

  @Post()
  create(@Body() body: Prisma.AuditLogUncheckedCreateInput) {
    return this.auditLogs.create(body);
  }
}
