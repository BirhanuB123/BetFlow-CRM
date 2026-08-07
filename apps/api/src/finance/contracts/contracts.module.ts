import { Module } from '@nestjs/common';
import { AuthModule } from '../../core/auth/auth.module';
import { DatabaseModule } from '../../database/database.module';
import { ContractsController } from './contracts.controller';
import { ContractsService } from './contracts.service';
import { ContractBuilderService } from './contract-builder.service';
import { PdfGeneratorService } from './pdf-generator.service';

import { DocumentsModule } from '../../platform/documents/documents.module';

@Module({
  imports: [DatabaseModule, AuthModule, DocumentsModule],
  controllers: [ContractsController],
  providers: [ContractsService, ContractBuilderService, PdfGeneratorService],
  exports: [ContractsService, ContractBuilderService, PdfGeneratorService],
})
export class ContractsModule {}
