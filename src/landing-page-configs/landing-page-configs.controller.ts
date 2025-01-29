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
import { CreateOrUpdateAppConfigDto } from './dtos/create-app-config.dto';

const { RESOURCE_CREATED } = getMessages('Destination(s)');

@ApiTags('landing-page-configs')
@Controller('landing-page-configs')
export class LandingPageConfigsController {
    constructor(private landingPageConfigsService: LandingPageConfigsService) { }

    @ApiBearerAuth(AuthorizationHeader)
    @UseGuards(JWTAuthGuard, RolesGuard)
    @Roles(Role.SUPER_ADMIN,Role.INTERNAL_ADMIN,Role.USER)
    @Post('app-config')
    @ApiBody({ type: CreateOrUpdateAppConfigDto })
    async createOrUpdateAppConfig(@Body() body: CreateOrUpdateAppConfigDto, @Req() req: Request) {
      const updatedConfig = await this.landingPageConfigsService.createOrUpdateConfig(body, req.user);
      return { message: RESOURCE_CREATED, data: updatedConfig };
  }
  
    @Get('app-config')
    async getAppConfig() {
      const appConfig = await this.landingPageConfigsService.getAppConfig();
      return { message: 'App configuration fetched successfully', data: appConfig };
    }

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
