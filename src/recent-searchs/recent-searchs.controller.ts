import { Controller, Get, Post, Body, Query, Req, BadRequestException, UseGuards } from '@nestjs/common';
import getMessages from 'src/app/api-messages';
import { ApiTags, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthorizationHeader } from 'src/app/swagger.constant';
import { JWTAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { RecentSearchsService } from './recent-searchs.service';

const { RESOURCE_CREATED } = getMessages('options(s)');


@Controller('recent-searchs')
@ApiTags('recent-searchs')
export class RecentSearchsController {

    constructor(private recentSearchsService: RecentSearchsService) { }


    @ApiBearerAuth(AuthorizationHeader)
    @UseGuards(JWTAuthGuard)
    @Get('cars')
    async cars() {
        const options = await this.recentSearchsService.getCarRecentSearchs();
        return { message: 'Recent Cars fetched successfully', data: options };
    }

    @ApiBearerAuth(AuthorizationHeader)
    @UseGuards(JWTAuthGuard)
    @Get('hotels')
    async detail() {
        const options = await this.recentSearchsService.getHotelRecentSearchs();
        return { message: 'Recent hotels fetched successfully', data: options };
    }

}
