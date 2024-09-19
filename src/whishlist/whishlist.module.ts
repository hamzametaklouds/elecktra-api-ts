import { Module } from '@nestjs/common';
import { WhishlistController } from './whishlist.controller';
import { WhishlistService } from './whishlist.service';
import { DatabaseModule } from 'src/database/database.module';
import { WhishlistModel } from './whishlist.model';
import { HotelAndCarsModule } from 'src/hotel-and-cars/hotel-and-cars.module';

@Module({
  imports: [DatabaseModule, HotelAndCarsModule],
  controllers: [WhishlistController],
  providers: [WhishlistService, ...WhishlistModel],
  exports: [WhishlistService]

})
export class WhishlistModule { }
