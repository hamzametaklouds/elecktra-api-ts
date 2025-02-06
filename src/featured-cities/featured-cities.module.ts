import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { FeaturedCitiesController } from './featured-cities.controller';
import { FeaturedCitiesService } from './featured-cities.service';
import { FeaturedCitiesModel } from './featured-cities.model';

@Module({
    imports: [DatabaseModule],
    controllers: [FeaturedCitiesController],
    providers: [FeaturedCitiesService, ...FeaturedCitiesModel],
    exports: [FeaturedCitiesService]
  })
export class FeaturedCitiesModule {}
