import { Module } from '@nestjs/common';
import { AuthModule } from '../../core/auth/auth.module';
import { DatabaseModule } from '../../database/database.module';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';
import { AiScoringService } from './ai-scoring.service';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [LeadsController],
  providers: [LeadsService, AiScoringService],
  exports: [LeadsService, AiScoringService],
})
export class LeadsModule {}
