import { Controller, Post, Body, Req, Get, Query, } from '@nestjs/common';
import getMessages from 'src/app/api-messages';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import { Request } from 'express';
import { CreateDestinationDto } from './dtos/create-destination.dto';
import { DestinationsService } from './destinations.service';

const { RESOURCE_CREATED } = getMessages('screen(s)');

@ApiTags('destinations')
@Controller('destinations')
export class DestinationsController {
    constructor(private destinationsService: DestinationsService) { }


    @Get()
    async detail() {
        const hotels = await this.destinationsService.destinations();
        return { message: 'Hotels Data fetched successfully', data: hotels };
    }

    // @ApiBearerAuth(AuthorizationHeader)
    // @UseGuards(JWTAuthGuard)
    @Post()
    @ApiBody({ type: CreateDestinationDto })
    async insert(@Body() body: CreateDestinationDto, @Req() req: Request) {
        const createDestination = await this.destinationsService.insertScreen(body, req.user);
        return { message: RESOURCE_CREATED, data: createDestination };
    }


}
