import { Module } from '@nestjs/common';
import { ProjectsModule } from './projects/projects.module';
import { PropertiesModule } from './properties/properties.module';
import { UnitsModule } from './units/units.module';
import { SiteVisitsModule } from './site-visits/site-visits.module';
import { ReservationsModule } from './reservations/reservations.module';

@Module({
  imports: [
    ProjectsModule,
    PropertiesModule,
    UnitsModule,
    SiteVisitsModule,
    ReservationsModule,
  ],
  exports: [
    ProjectsModule,
    PropertiesModule,
    UnitsModule,
    SiteVisitsModule,
    ReservationsModule,
  ],
})
export class RealEstateModule {}
