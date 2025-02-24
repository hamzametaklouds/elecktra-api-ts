import { Module, forwardRef } from '@nestjs/common';
import { StripeController } from './stripe.controller';
import { StripeService } from './stripe.service';
import { BookingsModule } from '../bookings/bookings.module';

@Module({
  imports: [forwardRef(() => BookingsModule)],
  controllers: [StripeController],
  providers: [StripeService],
  exports: [StripeService]
})
export class StripeModule { }
