import { Controller, Post, Body, Req, UseGuards, Get } from '@nestjs/common';
import getMessages from 'src/app/api-messages';
import { ApiTags, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { WhishlistService } from './whishlist.service';
import { CreateWhishlistDto } from './dtos/create-whishlist.dto';
import { AuthorizationHeader } from 'src/app/swagger.constant';
import { JWTAuthGuard } from 'src/auth/guards/jwt-auth-guard';

const { RESOURCE_CREATED } = getMessages('whishlist(s)');


@Controller('wishlist')
@ApiTags('wishlist')
export class WhishlistController {
    constructor(private whishlistService: WhishlistService) { }


    @ApiBearerAuth(AuthorizationHeader)
    @UseGuards(JWTAuthGuard)
    @Get()
    async get(@Req() req: Request) {
        const screens = await this.whishlistService.getWishlist(req.user)

        return screens;
    }


    @ApiBearerAuth(AuthorizationHeader)
    @UseGuards(JWTAuthGuard)
    @Post('add')
    @ApiBody({ type: CreateWhishlistDto })
    async add(@Body() body: CreateWhishlistDto, @Req() req: Request) {
        const addWhishlist = await this.whishlistService.insertWhishlist(body, req.user);
        return { message: 'Added in whishlist', data: addWhishlist };
    }

    @ApiBearerAuth(AuthorizationHeader)
    @UseGuards(JWTAuthGuard)
    @Post('remove')
    @ApiBody({ type: CreateWhishlistDto })
    async remove(@Body() body: CreateWhishlistDto, @Req() req: Request) {
        const createScreenConfig = await this.whishlistService.removeWhishlist(body, req.user);
        return { message: 'Removed from whishlist', data: createScreenConfig };
    }

}

