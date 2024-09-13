import { Controller, Post, Get, Body, Req, UseGuards, Query } from '@nestjs/common';
import getMessages from 'src/app/api-messages';
import { ApiBearerAuth, ApiTags, ApiBody, ApiQuery } from '@nestjs/swagger';
import { Request } from 'express';
import { PlanTripDto } from './dtos/book-trip.dto';
import { JWTAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { AuthorizationHeader } from 'src/app/swagger.constant';
import { HotelAndCarsService } from './hotel-and-cars.service';
import { ParamsHandler } from 'src/app/custom-decorators/params-handler.decorator';
import { IPaginationQuery } from 'src/app/interfaces';
import { QueryParamsDTO } from 'src/app/dtos/query-params.dto';

const { RESOURCE_CREATED } = getMessages('boking(s)');

@ApiTags('hotel-and-cars')
@Controller('hotel-and-cars')
export class HotelAndCarsController {
    constructor(private hotelAndCarsService: HotelAndCarsService) { }

    @ApiBearerAuth(AuthorizationHeader)
    @UseGuards(JWTAuthGuard)
    @ApiQuery({ type: QueryParamsDTO })
    @Post('plan')
    @ApiBody({ type: PlanTripDto })
    async planTrip(@ParamsHandler() pagination: IPaginationQuery, @Body() body: PlanTripDto, @Req() req: Request) {
        const { $rpp, $page, $filter, $orderBy } = pagination;
        const createBooking = await this.hotelAndCarsService.planTrip(body, req.user);
        return { message: 'Hotels Data fetched successfully', data: createBooking };
    }

    @ApiBearerAuth(AuthorizationHeader)
    @UseGuards(JWTAuthGuard)
    @Get('detail')
    async detail(@Query('hotel_id') hotel_id: string, @Req() req: Request) {
        const hotels = await this.hotelAndCarsService.hotelDetail(hotel_id, req.user);
        return { message: 'Hotels Data fetched successfully', data: hotels };
    }

}
