import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { AuthorizationHeader } from 'src/app/swagger.constant';
import { JWTAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { FAQService } from './faq.service';
import { ValidForType } from './faq.schema';
import { Request } from 'express';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';

@Controller('faqs')
@ApiTags('FAQs')
export class FAQController {
    constructor(private faqService: FAQService) { }

    @Post()
    @ApiBearerAuth(AuthorizationHeader)
    @UseGuards(JWTAuthGuard)
    @ApiOperation({ summary: 'Create a new FAQ' })
    @ApiResponse({ 
        status: 201, 
        description: 'FAQ has been successfully created.'
    })
    @ApiResponse({ 
        status: 400, 
        description: 'Bad Request.' 
    })
    async create(
        @Body() createFaqDto: CreateFaqDto,
        @Req() req: Request & { user: any }
    ) {
        const faq = await this.faqService.create(createFaqDto, req.user);
        return { message: 'FAQ created successfully', data: faq };
    }

    @Put(':id')
    @ApiBearerAuth(AuthorizationHeader)
    @UseGuards(JWTAuthGuard)
    @ApiOperation({ summary: 'Update an existing FAQ' })
    @ApiParam({ name: 'id', description: 'FAQ ID' })
    @ApiResponse({ 
        status: 200, 
        description: 'FAQ has been successfully updated.'
    })
    @ApiResponse({ 
        status: 404, 
        description: 'FAQ not found.'
    })
    async update(
        @Param('id') id: string,
        @Body() updateFaqDto: UpdateFaqDto,
        @Req() req: Request & { user: any }
    ) {
        const faq = await this.faqService.update(id, updateFaqDto, req.user);
        return { message: 'FAQ updated successfully', data: faq };
    }

    @Get()
    @ApiOperation({ summary: 'Get all FAQs' })
    @ApiQuery({ 
        name: 'valid_for',
        enum: ValidForType,
        required: false,
        description: 'Filter FAQs by platform'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Returns all FAQs'
    })
    async getAll(@Query('valid_for') validFor?: ValidForType) {
        const faqs = await this.faqService.getAll(validFor);
        return { message: 'FAQs fetched successfully', data: faqs };
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get FAQ by ID' })
    @ApiParam({ name: 'id', description: 'FAQ ID' })
    @ApiResponse({ 
        status: 200, 
        description: 'Returns a single FAQ'
    })
    @ApiResponse({ 
        status: 404, 
        description: 'FAQ not found'
    })
    async getById(@Param('id') id: string) {
        const faq = await this.faqService.getById(id);
        return { message: 'FAQ fetched successfully', data: faq };
    }
} 