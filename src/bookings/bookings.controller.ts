import { Controller, Post, Body, Req, UseGuards, Get, Query } from '@nestjs/common';
import getMessages from 'src/app/api-messages';
import { ApiBearerAuth, ApiTags, ApiBody } from '@nestjs/swagger';
import { Request } from 'express';
import { BookingsService } from './bookings.service';
import { CreateBookingsDto } from './dtos/create-bookings.dto';
import { JWTAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { AuthorizationHeader } from 'src/app/swagger.constant';
import { CreatePaymentDto } from './dtos/create-payment';

const { RESOURCE_CREATED } = getMessages('boking(s)');

@ApiTags('bookings')
@Controller('bookings')
export class BookingsController {

    constructor(private bookingsService: BookingsService) { }


    @ApiBearerAuth(AuthorizationHeader)
    @UseGuards(JWTAuthGuard)
    @Get()
    async getCar(@Req() req: Request) {
        const screens = await this.bookingsService.getBookingsForUser(req.user)

        return screens;
    }


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
    @Post('cancellation')
    async bookingCancel(@Query('booking_id') booking_id: string, @Req() req: Request) {
        const cancelBooking = await this.bookingsService.cancelBooking(booking_id, req.user);
        return { message: 'Booking cancelled successfully', data: cancelBooking };
    }

    @ApiBearerAuth(AuthorizationHeader)
    @UseGuards(JWTAuthGuard)
    @Post('checkout')
    async checkoutBooking(@Query('booking_id') booking_id: string, @Req() req: Request) {
        const cancelBooking = await this.bookingsService.checkoutBooking(booking_id, req.user);
        return { message: 'Booking checkout successfully', data: cancelBooking };
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
