import { Controller, Get } from '@nestjs/common';
import { InMemoryService } from '../database/in-memory.service';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly store: InMemoryService) {}

  @Get()
  list() {
    return this.store.listPermissions();
  }
}
