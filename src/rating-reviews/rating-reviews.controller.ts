import { Controller, Get, Post, Body, Query, Req, BadRequestException, UseGuards } from '@nestjs/common';
import getMessages from 'src/app/api-messages';
import { ApiTags, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthorizationHeader } from 'src/app/swagger.constant';
import { JWTAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { CreateRatingReviewDto } from './dtos/create-rating-reviews.dto';
import { RatingReviewsService } from './rating-reviews.service';
import { CreateCustomRatingReviewDto } from './dtos/create-custom-rating-reviews.dto';
import { RolesGuard } from 'src/app/guards/role-guard';
import { Roles } from 'src/app/dtos/roles-decorator';
import { Role } from 'src/roles/roles.schema';

const { RESOURCE_CREATED } = getMessages('review(s)');

@Controller('rating-reviews')
@ApiTags('rating-reviews')
export class RatingReviewsController {

    constructor(private ratingReviewsService: RatingReviewsService) { }


    @Get('custom')
    async get() {
        return await this.ratingReviewsService.getCustomeReviews()
    }

    @ApiBearerAuth(AuthorizationHeader)
    @UseGuards(JWTAuthGuard)
    @Post()
    @ApiBody({ type: CreateRatingReviewDto })
    async insert(@Body() body: CreateRatingReviewDto, @Req() req: Request) {
        const createRatingReview = await this.ratingReviewsService.insertRatingReview(body, req.user);
        return { message: RESOURCE_CREATED, data: createRatingReview };
    }

    @ApiBearerAuth(AuthorizationHeader)
    @UseGuards(JWTAuthGuard, RolesGuard)
    @Roles(Role.SUPER_ADMIN)
    @Post('custom')
    @ApiBody({ type: CreateCustomRatingReviewDto })
    async insertCustomReview(@Body() body: CreateCustomRatingReviewDto, @Req() req: Request) {
        const createRatingReview = await this.ratingReviewsService.insertCustomRatingReview(body, req.user);
        return { message: RESOURCE_CREATED, data: createRatingReview };
    }



}
