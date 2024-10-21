import { Controller, Get, Post, Body, Query, Req, BadRequestException, UseGuards } from '@nestjs/common';
import getMessages from 'src/app/api-messages';
import { ApiTags, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthorizationHeader } from 'src/app/swagger.constant';
import { JWTAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { CreateRatingReviewDto } from './dtos/create-rating-reviews.dto';
import { RatingReviewsService } from './rating-reviews.service';

const { RESOURCE_CREATED } = getMessages('review(s)');

@Controller('rating-reviews')
@ApiTags('rating-reviews')
export class RatingReviewsController {

    constructor(private ratingReviewsService: RatingReviewsService) { }

    @ApiBearerAuth(AuthorizationHeader)
    @UseGuards(JWTAuthGuard)
    @Post()
    @ApiBody({ type: CreateRatingReviewDto })
    async insert(@Body() body: CreateRatingReviewDto, @Req() req: Request) {
        const createRatingReview = await this.ratingReviewsService.insertRatingReview(body, req.user);
        return { message: RESOURCE_CREATED, data: createRatingReview };
    }



}
