import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import getMessages from 'src/app/api-messages';
import { ApiBearerAuth, ApiTags, ApiBody } from '@nestjs/swagger';
import { Request } from 'express';
import { BookingsService } from './bookings.service';
import { CreateBookingsDto } from './dtos/create-bookings.dto';
import { PlanTripDto } from '../hotel-and-cars/dtos/book-trip.dto';
import { JWTAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { AuthorizationHeader } from 'src/app/swagger.constant';
import { CreatePaymentIntentDto } from './dtos/create-payment-intent';
import { CreatePaymentDto } from './dtos/create-payment';

const { RESOURCE_CREATED } = getMessages('boking(s)');

@ApiTags('bookings')
@Controller('bookings')
export class BookingsController {

    constructor(private bookingsService: BookingsService) { }

    @ApiBearerAuth(AuthorizationHeader)
    @UseGuards(JWTAuthGuard)
    @Post()
    @ApiBody({ type: CreateBookingsDto })
    async insert(@Body() body: CreateBookingsDto, @Req() req: Request) {
        const createBooking = await this.bookingsService.insertBooking(body, req.user);
        return { message: RESOURCE_CREATED, data: createBooking };
    }

    @ApiBearerAuth(AuthorizationHeader)
    @UseGuards(JWTAuthGuard)
    @Post('payment')
    @ApiBody({ type: CreatePaymentDto })
    async intent(@Body() body: CreatePaymentDto, @Req() req: Request) {
        const createBooking = await this.bookingsService.verifyPayment(body, req.user);
        return { message: 'Payment Successful', data: createBooking };
    }

}
