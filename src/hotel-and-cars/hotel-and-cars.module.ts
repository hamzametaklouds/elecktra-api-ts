import { Module, forwardRef } from '@nestjs/common';
import { HotelAndCarsController } from './hotel-and-cars.controller';
import { HotelAndCarsService } from './hotel-and-cars.service';
import { DatabaseModule } from 'src/database/database.module';
import { HotelAndCarModel } from './hotel-and-cars.model';
import { WhishlistModule } from 'src/whishlist/whishlist.module';
import { RecentSearchsModule } from 'src/recent-searchs/recent-searchs.module';

@Module({
  imports: [DatabaseModule, forwardRef(() => WhishlistModule), RecentSearchsModule],
  controllers: [HotelAndCarsController],
  providers: [HotelAndCarsService, ...HotelAndCarModel],
  exports: [HotelAndCarsService]
})
export class HotelAndCarsModule { }
