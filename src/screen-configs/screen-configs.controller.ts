import { Controller, Get, Post, Body, Query, Req, BadRequestException, UseGuards, Put } from '@nestjs/common';
import getMessages from 'src/app/api-messages';
import { ApiTags, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { ScreenConfigsService } from './screen-configs.service';
import { CreateScreenConfigDto } from './dtos/create-screen-configs.dto';
import { Request } from 'express';
import { ScreenType } from './screen-configs.schema';
import { AuthorizationHeader } from 'src/app/swagger.constant';
import { JWTAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { UpdateScreenConfigDto } from './dtos/update-screen-config.dto';

const { RESOURCE_CREATED } = getMessages('screen(s)');


@Controller('screen-configs')
@ApiTags('screen-configs')
export class ScreenConfigsController {
    constructor(private screenConfigService: ScreenConfigsService) { }

    // @Get()
    // @ApiQuery({ type: QueryParamsDTO })
    // async get(@ParamsHandler() pagination: IPaginationQuery) {
    //     const { $rpp, $page, $filter, $orderBy } = pagination;
    //     if ($rpp && $page) {
    //         return await this.screenConfigService.getPaginatedNotification($rpp, $page, $filter, $orderBy);
    //     }
    //     return {
    //         data: await this.screenConfigService.getFilteredNotification($filter, $orderBy),
    //     };

    // }

    @Get()
    async get(@Query('screen') screen: string) {

        const valueValid = Object.values(ScreenType).includes(screen as ScreenType);
        let screens;

        if (valueValid) {
            screens = await this.screenConfigService.getScreens(screen)
        }
        else {
            throw new BadRequestException('Invalid Value')
        }

        return screens


    }


    @ApiBearerAuth(AuthorizationHeader)
    @UseGuards(JWTAuthGuard)
    @Post()
    @ApiBody({ type: CreateScreenConfigDto })
    async insert(@Body() body: CreateScreenConfigDto, @Req() req: Request) {
        const createScreenConfig = await this.screenConfigService.insertScreen(body, req.user);
        return { message: RESOURCE_CREATED, data: createScreenConfig };
    }

    @ApiBearerAuth(AuthorizationHeader)
    @UseGuards(JWTAuthGuard)
    @Put()
    @ApiBody({ type: UpdateScreenConfigDto })
    async update(@Query('id') id: string, @Body() body: UpdateScreenConfigDto, @Req() req: Request) {
        const updateScreenConfig = await this.screenConfigService.updateScreen(id, body, req.user);
        return { message: 'Screen config updated', data: updateScreenConfig };
    }

}
