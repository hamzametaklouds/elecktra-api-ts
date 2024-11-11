import { Controller, Post, Body, Req, Get, Query, UseGuards, Put, } from '@nestjs/common';
import getMessages from 'src/app/api-messages';
import { ApiTags, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { RolesGuard } from 'src/app/guards/role-guard';
import { AuthorizationHeader } from 'src/app/swagger.constant';
import { JWTAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { Roles } from 'src/app/dtos/roles-decorator';
import { Role } from 'src/roles/roles.schema';
import { LandingPageConfigsService } from './landing-page-configs.service';
import { CreateLandingPageConfigDto } from './dtos/create-destination.dto';

const { RESOURCE_CREATED } = getMessages('Destination(s)');

@ApiTags('landing-page-configs')
@Controller('landing-page-configs')
export class LandingPageConfigsController {
    constructor(private landingPageConfigsService: LandingPageConfigsService) { }


    @Get()
    async detail() {
        const hotels = await this.landingPageConfigsService.landingConfigs();
        return { message: 'Configs fetched successfully', data: hotels };
    }


    @ApiBearerAuth(AuthorizationHeader)
    @UseGuards(JWTAuthGuard, RolesGuard)
    @Roles(Role.SUPER_ADMIN)
    @Post()
    @ApiBody({ type: CreateLandingPageConfigDto })
    async insert(@Body() body: CreateLandingPageConfigDto, @Req() req: Request) {
        const createDestination = await this.landingPageConfigsService.insertScreen(body, req.user);
        return { message: 'Landing page configuration created succesfully', data: createDestination };
    }
}
