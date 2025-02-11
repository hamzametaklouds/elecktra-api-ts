import { Controller, Post, Body, Req, UseGuards, Get, Query, Put } from '@nestjs/common';
import getMessages from 'src/app/api-messages';
import { ApiBearerAuth, ApiTags, ApiBody, ApiQuery } from '@nestjs/swagger';
import { Request } from 'express';
import { BookingsService } from './bookings.service';
import { CreateBookingsDto } from './dtos/create-bookings.dto';
import { JWTAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { AuthorizationHeader } from 'src/app/swagger.constant';
import { CreatePaymentDto } from './dtos/create-payment';
import { RolesGuard } from 'src/app/guards/role-guard';
import { Roles } from 'src/app/dtos/roles-decorator';
import { Role } from 'src/roles/roles.schema';
import { IPaginationQuery } from 'src/app/interfaces';
import { QueryParamsDTO } from 'src/app/dtos/query-params.dto';
import { ParamsHandler } from 'src/app/custom-decorators/params-handler.decorator';
import { UpdateCompanyPaymentDto } from './dtos/update-company-payment';

const { RESOURCE_CREATED } = getMessages('boking(s)');

@ApiTags('bookings')
@Controller('bookings')
export class BookingsController {

    constructor(private bookingsService: BookingsService) { }

    @ApiBearerAuth(AuthorizationHeader)
    @UseGuards(JWTAuthGuard, RolesGuard)
    @Roles(Role.SUPER_ADMIN, Role.INTERNAL_ADMIN, Role.COMPANY_ADMIN, Role.USER)
    @Get('dashboard')
    async getDashboardData(@Req() req: Request) {
        return await this.bookingsService.getDashBoardDetails(req.user)
    }


    @ApiBearerAuth(AuthorizationHeader)
    @UseGuards(JWTAuthGuard, RolesGuard)
    @Roles(Role.SUPER_ADMIN, Role.INTERNAL_ADMIN, Role.COMPANY_ADMIN, Role.USER)
    @Get('list')
    @ApiQuery({ type: QueryParamsDTO })
    async getUserList(@ParamsHandler() pagination: IPaginationQuery, @Req() req: Request) {
        const { $rpp, $page, $filter, $orderBy } = pagination;
        if ($rpp && $page) {
            const result = await this.bookingsService.getPaginatedUsers($rpp, $page, $filter, $orderBy, req.user);
            return {
                status: result ? true : false,
                statusCode: result ? 200 : 400,
                message: result ? 'Result of query fetched successfully' : 'Something went wrong with parameters, Kindly have a look and try again',
                data: result ? result : null
            }
        }
        const result = await this.bookingsService.getFilteredUsers($filter, $orderBy, req.user);
        return {
            status: result ? true : false,
            statusCode: result ? 200 : 400,
            message: result ? 'Result of query fetched successfully' : 'Something went wrong with parameters, Kindly have a look and try again',
            data: result ? result : null
        }
    }


    @ApiBearerAuth(AuthorizationHeader)
    @UseGuards(JWTAuthGuard, RolesGuard)
    @Roles(Role.SUPER_ADMIN, Role.INTERNAL_ADMIN, Role.COMPANY_ADMIN, Role.USER)
    @Get('detail')
    async getBookingDetail(@Query('id') id: string, @Req() req: Request) {
        const screens = await this.bookingsService.getBookingDetail(id, req.user)
        return screens;
    }



    @ApiBearerAuth(AuthorizationHeader)
    @UseGuards(JWTAuthGuard, RolesGuard)
    @Roles(Role.USER)
    @Get()
    async getCar(@Req() req: Request) {
        const screens = await this.bookingsService.getBookingsForUser(req.user)
        return screens;
    }


    @ApiBearerAuth(AuthorizationHeader)
    @UseGuards(JWTAuthGuard, RolesGuard)
    @Roles(Role.USER)
    @Post()
    @ApiBody({ type: CreateBookingsDto })
    async insert(@Body() body: CreateBookingsDto, @Req() req: Request) {
        const createBooking = await this.bookingsService.insertBooking(body, req.user);
        return { message: RESOURCE_CREATED, data: createBooking };
    }

    @ApiBearerAuth(AuthorizationHeader)
    @UseGuards(JWTAuthGuard, RolesGuard)
    @Roles(Role.SUPER_ADMIN, Role.INTERNAL_ADMIN, Role.COMPANY_ADMIN, Role.USER)
    @Put()
    @ApiBody({ type: UpdateCompanyPaymentDto })
    async updateCompany(@Query('id') id: string, @Body() body: UpdateCompanyPaymentDto, @Req() req: Request) {
        const updateBooking = await this.bookingsService.updateBookingCompanyStatus(id, body, req.user);
        return { message: 'Company Status updated successfully', data: updateBooking };
    }

    @ApiBearerAuth(AuthorizationHeader)
    @UseGuards(JWTAuthGuard, RolesGuard)
    @Roles(Role.SUPER_ADMIN, Role.INTERNAL_ADMIN, Role.COMPANY_ADMIN, Role.USER)
    @Post('cancellation')
    async bookingCancel(@Query('booking_id') booking_id: string, @Req() req: Request) {
        const cancelBooking = await this.bookingsService.cancelBooking(booking_id, req.user);
        return { message: 'Booking cancelled successfully', data: cancelBooking };
    }

    @ApiBearerAuth(AuthorizationHeader)
    @UseGuards(JWTAuthGuard, RolesGuard)
    @Roles(Role.SUPER_ADMIN, Role.INTERNAL_ADMIN, Role.COMPANY_ADMIN, Role.USER)
    @Post('checkout')
    async checkoutBooking(@Query('booking_id') booking_id: string, @Req() req: Request) {
        const cancelBooking = await this.bookingsService.checkoutBooking(booking_id, req.user);
        return { message: 'Booking checkout successfully', data: cancelBooking };
    }

    @ApiBearerAuth(AuthorizationHeader)
    @UseGuards(JWTAuthGuard, RolesGuard)
    @Roles(Role.SUPER_ADMIN, Role.INTERNAL_ADMIN,Role.USER)
    @Post('withdraw-payment')
    async withDrawPayment(@Query('booking_id') booking_id: string, @Req() req: Request) {
        const cancelBooking = await this.bookingsService.withdrawPayment(booking_id, req.user);
        return { message: 'Payment Withdrawn', data: cancelBooking };
    }

    @ApiBearerAuth(AuthorizationHeader)
    @UseGuards(JWTAuthGuard, RolesGuard)
    @Roles(Role.SUPER_ADMIN, Role.INTERNAL_ADMIN, Role.COMPANY_ADMIN, Role.USER)
    @Post('payment')
    @ApiBody({ type: CreatePaymentDto })
    async intent(@Body() body: CreatePaymentDto, @Req() req: Request) {
        const createBooking = await this.bookingsService.verifyPayment(body, req.user);
        return { message: 'Payment Successful', data: createBooking };
    }

    // @ApiBearerAuth(AuthorizationHeader)
    // @UseGuards(JWTAuthGuard, RolesGuard)
    // @Roles(Role.INTERNAL_ADMIN, Role.SUPER_ADMIN)
    // @Post('company-payment')
    // @ApiBody({ type: CreateCompanyPaymentDto })
    // async companyPayment(@Query('booking_id') booking_id: string, @Body() body: CreateCompanyPaymentDto, @Req() req: Request) {
    //     const createBooking = await this.bookingsService.insertBookingPayment(booking_id, body, req.user);
    //     return { message: 'Payment Successful', data: createBooking };
    // }

}
