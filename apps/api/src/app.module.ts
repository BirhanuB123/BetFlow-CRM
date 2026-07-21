import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from './core/core.module';
import { CrmModule } from './crm/crm.module';
import { RealEstateModule } from './real-estate/real-estate.module';
import { FinanceModule } from './finance/finance.module';
import { PlatformModule } from './platform/platform.module';

@Module({
  imports: [
    CoreModule,
    CrmModule,
    RealEstateModule,
    FinanceModule,
    PlatformModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
