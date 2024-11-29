import { Controller, Post, Get, Body, Req, UseGuards, Query, UsePipes, ValidationPipe, Put } from '@nestjs/common';
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
import { CreateHotelAndCarDto } from './dtos/create-hotel-or-car.dto';
import { PlanCarTripDto } from './dtos/book-car.dto';
import { RolesGuard } from 'src/app/guards/role-guard';
import { Role } from 'src/roles/roles.schema';
import { Roles } from 'src/app/dtos/roles-decorator';
import { CreateIdealCarDto } from './dtos/create-car-ideal.dto';
import { UpdateIdealCarDto } from './dtos/update-car-ideal.dto';
import { UpdateHotelAndCarDto } from './dtos/update-hotel-or-car.dto';

const { RESOURCE_CREATED } = getMessages('hotel-or-car(s)');

@ApiTags('hotel-and-cars')
@Controller('hotel-and-cars')
export class HotelAndCarsController {
    constructor(private hotelAndCarsService: HotelAndCarsService) { }

    @ApiBearerAuth(AuthorizationHeader)
    @UseGuards(JWTAuthGuard, RolesGuard)
    @Roles(Role.SUPER_ADMIN, Role.INTERNAL_ADMIN, Role.COMPANY_ADMIN)
    @Get()
    @ApiQuery({ type: QueryParamsDTO })
    async getUserList(@ParamsHandler() pagination: IPaginationQuery, @Req() req: Request) {
        const { $rpp, $page, $filter, $orderBy } = pagination;
        if ($rpp && $page) {
            const result = await this.hotelAndCarsService.getPaginatedUsers($rpp, $page, $filter, $orderBy, req.user);
            return {
                status: result ? true : false,
                statusCode: result ? 200 : 400,
                message: result ? 'Result of query fetched successfully' : 'Something went wrong with parameters, Kindly have a look and try again',
                data: result ? result : null
            }
        }
        const result = await this.hotelAndCarsService.getFilteredUsers($filter, $orderBy, req.user);
        return {
            status: result ? true : false,
            statusCode: result ? 200 : 400,
            message: result ? 'Result of query fetched successfully' : 'Something went wrong with parameters, Kindly have a look and try again',
            data: result ? result : null
        }
    }


    @ApiBearerAuth(AuthorizationHeader)
    @UseGuards(JWTAuthGuard)
    @ApiQuery({ type: QueryParamsDTO })
    @Post('plan')
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    @ApiBody({ type: PlanTripDto })
    async planTrip(@ParamsHandler() pagination: IPaginationQuery, @Body() body: PlanTripDto, @Req() req: Request) {
        const { $rpp, $page, $filter, $orderBy } = pagination;
        const createBooking = await this.hotelAndCarsService.planTrip(body, req.user, $filter, $orderBy);
        return { message: 'Hotels Data fetched successfully', data: createBooking };
    }

    @ApiBearerAuth(AuthorizationHeader)
    @UseGuards(JWTAuthGuard)
    @ApiQuery({ type: QueryParamsDTO })
    @Post('plan/car')
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    @ApiBody({ type: PlanCarTripDto })
    async planCarTrip(@ParamsHandler() pagination: IPaginationQuery, @Body() body: PlanCarTripDto, @Req() req: Request) {
        const { $rpp, $page, $filter, $orderBy } = pagination;
        console.log(req.user)
        const createBooking = await this.hotelAndCarsService.planCarTrip(body, req.user, $filter, $orderBy);
        return { message: 'Cars Data fetched successfully', data: createBooking };
    }

    @ApiBearerAuth(AuthorizationHeader)
    @UseGuards(JWTAuthGuard)
    @Roles(Role.SUPER_ADMIN, Role.INTERNAL_ADMIN, Role.COMPANY_ADMIN, Role.USER)
    @Get('detail')
    async detail(@Query('hotel_id') hotel_id: string, @Req() req: Request) {
        const hotels = await this.hotelAndCarsService.hotelDetail(hotel_id, req.user);
        return { message: 'Hotels Data fetched successfully', data: hotels };
    }

    @ApiBearerAuth(AuthorizationHeader)
    @UseGuards(JWTAuthGuard, RolesGuard)
    @Roles(Role.SUPER_ADMIN, Role.INTERNAL_ADMIN, Role.COMPANY_ADMIN, Role.USER)
    @Get('car/detail')
    async detailCar(@Query('car_id') hotel_id: string, @Req() req: Request) {
        const hotels = await this.hotelAndCarsService.hotelCarDetail(hotel_id, req.user);
        return { message: 'Cars Data fetched successfully', data: hotels };
    }

    @ApiBearerAuth(AuthorizationHeader)
    @UseGuards(JWTAuthGuard, RolesGuard)
    @Roles(Role.SUPER_ADMIN, Role.INTERNAL_ADMIN, Role.COMPANY_ADMIN)
    @Post()
    @ApiBody({ type: CreateHotelAndCarDto })
    async insert(@Body() body: CreateHotelAndCarDto, @Req() req: Request) {
        const createOption = await this.hotelAndCarsService.insertOption(body, req.user);
        return { message: RESOURCE_CREATED, data: createOption };
    }

    @Get('ideal-car')
    async idealCars() {
        const hotels = await this.hotelAndCarsService.getIdealCars();
        return { message: 'Ideal Cars fetched successfully', data: hotels };
    }

    @ApiBearerAuth(AuthorizationHeader)
    @UseGuards(JWTAuthGuard, RolesGuard)
    @Roles(Role.SUPER_ADMIN, Role.INTERNAL_ADMIN)
    @Post('ideal-car')
    @ApiBody({ type: CreateIdealCarDto })
    async insertIdealCar(@Body() body: CreateIdealCarDto, @Req() req: Request) {
        const createOption = await this.hotelAndCarsService.insertIdealCar(body, req.user);
        return { message: 'Ideal Car created successfully', data: createOption };
    }


    @ApiBearerAuth(AuthorizationHeader)
    @UseGuards(JWTAuthGuard, RolesGuard)
    @Roles(Role.SUPER_ADMIN, Role.INTERNAL_ADMIN)
    @Put('ideal-car')
    @ApiBody({ type: UpdateIdealCarDto })
    async updateIdealCar(@Query('id') id: string, @Body() body: UpdateIdealCarDto, @Req() req: Request) {
        const createOption = await this.hotelAndCarsService.updateIdealCar(id, body, req.user);
        return { message: 'Ideal Car created successfully', data: createOption };
    }



    @ApiBearerAuth(AuthorizationHeader)
    @UseGuards(JWTAuthGuard, RolesGuard)
    @Roles(Role.SUPER_ADMIN, Role.INTERNAL_ADMIN, Role.COMPANY_ADMIN)
    @Put()
    @ApiBody({ type: UpdateHotelAndCarDto })
    async update(@Query('id') id: string, @Body() body: UpdateHotelAndCarDto, @Req() req: Request) {
        const createOption = await this.hotelAndCarsService.updateOption(id, body, req.user);
        return { message: 'Updated Successfully', data: createOption };
    }

}
