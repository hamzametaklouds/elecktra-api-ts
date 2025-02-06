import { Controller, Post, Body, Req, Get, Query, UseGuards, Put, Param } from '@nestjs/common';
import { ApiTags, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { FeaturedCitiesService } from './featured-cities.service';
import { CreateFeaturedCityDto } from './dtos/create-featured-city.dto';
import { UpdateFeaturedCityDto } from './dtos/update-featured-city.dto';
import { RolesGuard } from 'src/app/guards/role-guard';
import { AuthorizationHeader } from 'src/app/swagger.constant';
import { JWTAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { Roles } from 'src/app/dtos/roles-decorator';
import { Role } from 'src/roles/roles.schema';

@ApiTags('featured-cities')
@Controller('featured-cities')
export class FeaturedCitiesController {
    constructor(private featuredCitiesService: FeaturedCitiesService) { }

    @Get()
    async findAll() {
        const cities = await this.featuredCitiesService.findAll();
        return { message: 'Featured cities fetched successfully', data: cities };
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const city = await this.featuredCitiesService.findOne(id);
        return { message: 'Featured city fetched successfully', data: city };
    }

    @ApiBearerAuth(AuthorizationHeader)
    @UseGuards(JWTAuthGuard, RolesGuard)
    @Roles(Role.SUPER_ADMIN)
    @Post()
    @ApiBody({ type: CreateFeaturedCityDto })
    async create(@Body() body: CreateFeaturedCityDto, @Req() req: Request) {
        const city = await this.featuredCitiesService.create(body, req.user);
        return { message: 'Featured city created successfully', data: city };
    }

    @ApiBearerAuth(AuthorizationHeader)
    @UseGuards(JWTAuthGuard, RolesGuard)
    @Roles(Role.SUPER_ADMIN)
    @Put(':id')
    @ApiBody({ type: UpdateFeaturedCityDto })
    async update(@Param('id') id: string, @Body() body: UpdateFeaturedCityDto, @Req() req: Request) {
        const city = await this.featuredCitiesService.update(id, body, req.user);
        return { message: 'Featured city updated successfully', data: city };
    }
} 