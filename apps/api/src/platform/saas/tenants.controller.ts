import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { RequirePermission } from '../../common/decorators/roles.decorator';
import { SaasService } from './saas.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@RequirePermission('roles.manage')
@Controller('tenants')
export class TenantsController {
  constructor(private readonly saasService: SaasService) {}

  @Get()
  getCurrentTenant() {
    return this.saasService.getCurrentTenant();
  }

  @Patch(':id')
  updateTenant(
    @Param('id') id: string,
    @Body() body: { name?: string; currency?: string },
  ) {
    return this.saasService.updateTenant(id, body);
  }
}
