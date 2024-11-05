import { Controller, Post, Body, Req, Get, Query, UseGuards, Put, } from '@nestjs/common';
import getMessages from 'src/app/api-messages';
import { ApiTags, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { CreateDestinationDto } from './dtos/create-destination.dto';
import { DestinationsService } from './destinations.service';
import { RolesGuard } from 'src/app/guards/role-guard';
import { AuthorizationHeader } from 'src/app/swagger.constant';
import { JWTAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { Roles } from 'src/app/dtos/roles-decorator';
import { Role } from 'src/roles/roles.schema';
import { UpdateDestinationDto } from './dtos/update-destination.dto';

const { RESOURCE_CREATED } = getMessages('Destination(s)');

@ApiTags('destinations')
@Controller('destinations')
export class DestinationsController {
    constructor(private destinationsService: DestinationsService) { }


    @Get()
    async detail() {
        const hotels = await this.destinationsService.destinations();
        return { message: 'Destinations fetched successfully', data: hotels };
    }

    @Get('popular')
    async destinations() {
        const hotels = await this.destinationsService.destinations();
        return { message: 'Destinations fetched successfully', data: hotels };
    }

    @ApiBearerAuth(AuthorizationHeader)
    @UseGuards(JWTAuthGuard, RolesGuard)
    @Roles(Role.SUPER_ADMIN)
    @Post()
    @ApiBody({ type: CreateDestinationDto })
    async insert(@Body() body: CreateDestinationDto, @Req() req: Request) {
        const createDestination = await this.destinationsService.insertScreen(body, req.user);
        return { message: RESOURCE_CREATED, data: createDestination };
    }


    @ApiBearerAuth(AuthorizationHeader)
    @UseGuards(JWTAuthGuard, RolesGuard)
    @Roles(Role.SUPER_ADMIN)
    @Put()
    @ApiBody({ type: UpdateDestinationDto })
    async update(@Query('id') id: string, @Body() body: UpdateDestinationDto, @Req() req: Request) {
        const createDestination = await this.destinationsService.updateScreen(id, body, req.user);
        return { message: 'Destination updated successfully', data: createDestination };
    }

}
