import { Module } from '@nestjs/common';
import { ProjectsModule } from './projects/projects.module';
import { PropertiesModule } from './properties/properties.module';
import { UnitsModule } from './units/units.module';
import { SiteVisitsModule } from './site-visits/site-visits.module';
import { ReservationsModule } from './reservations/reservations.module';
import { ConstructionModule } from './construction/construction.module';

@Module({
  imports: [
    ProjectsModule,
    PropertiesModule,
    UnitsModule,
    SiteVisitsModule,
    ReservationsModule,
    ConstructionModule,
  ],
  exports: [
    ProjectsModule,
    PropertiesModule,
    UnitsModule,
    SiteVisitsModule,
    ReservationsModule,
    ConstructionModule,
  ],
})
export class RealEstateModule {}
