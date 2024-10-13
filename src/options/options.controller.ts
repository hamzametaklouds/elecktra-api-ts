import { Controller, Get, Post, Body, Query, Req, BadRequestException, UseGuards } from '@nestjs/common';
import getMessages from 'src/app/api-messages';
import { ApiTags, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { OptionsService } from './options.service';
import { CreateOptionDto } from './dtos/create-options.dto';
import { AuthorizationHeader } from 'src/app/swagger.constant';
import { JWTAuthGuard } from 'src/auth/guards/jwt-auth-guard';

const { RESOURCE_CREATED } = getMessages('options(s)');


@Controller('options')
@ApiTags('options')
export class OptionsController {

    constructor(private optionService: OptionsService) { }


    @ApiBearerAuth(AuthorizationHeader)
    @UseGuards(JWTAuthGuard)
    @Get('amenities')
    async detail() {
        const options = await this.optionService.getOptionsForAmenities();
        return { message: 'Amenities essentials and features fetched successfully', data: options };
    }

    @ApiBearerAuth(AuthorizationHeader)
    @UseGuards(JWTAuthGuard)
    @Get('car')
    async detailCar() {
        const options = await this.optionService.getOptionsForCars();
        return { message: 'Car Options fetched successfully', data: options };

    }


    @ApiBearerAuth(AuthorizationHeader)
    @UseGuards(JWTAuthGuard)
    @Post()
    @ApiBody({ type: CreateOptionDto })
    async insert(@Body() body: CreateOptionDto, @Req() req: Request) {
        const createOption = await this.optionService.insertOption(body, req.user);
        return { message: RESOURCE_CREATED, data: createOption };
    }


}
