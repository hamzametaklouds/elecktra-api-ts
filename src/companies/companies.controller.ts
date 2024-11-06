import { Controller, Get, Post, Body, Query, Req, BadRequestException, UseGuards, Put } from '@nestjs/common';
import getMessages from 'src/app/api-messages';
import { ApiTags, ApiBody, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthorizationHeader } from 'src/app/swagger.constant';
import { JWTAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dtos/create-company.dto';
import { UpdateCompanyDto } from './dtos/update-company.dto';
import { QueryParamsDTO } from 'src/app/dtos/query-params.dto';
import { ParamsHandler } from 'src/app/custom-decorators/params-handler.decorator';
import { IPaginationQuery } from 'src/app/interfaces';
import { RolesGuard } from 'src/app/guards/role-guard';
import { Role } from 'src/roles/roles.schema';
import { Roles } from 'src/app/dtos/roles-decorator';

const { RESOURCE_CREATED } = getMessages('Company(s)');


@Controller('companies')
@ApiTags('companies')
export class CompaniesController {

    constructor(private companiesService: CompaniesService) { }


    @ApiBearerAuth(AuthorizationHeader)
    @UseGuards(JWTAuthGuard)
    @Get()
    @ApiQuery({ type: QueryParamsDTO })
    async getUserList(@ParamsHandler() pagination: IPaginationQuery) {
        const { $rpp, $page, $filter, $orderBy } = pagination;
        if ($rpp && $page) {
            const result = await this.companiesService.getPaginatedUsers($rpp, $page, $filter, $orderBy);
            return {
                status: result ? true : false,
                statusCode: result ? 200 : 400,
                message: result ? 'Result of query fetched successfully' : 'Something went wrong with parameters, Kindly have a look and try again',
                data: result ? result : null
            }
        }
        const result = await this.companiesService.getFilteredUsers($filter, $orderBy);
        return {
            status: result ? true : false,
            statusCode: result ? 200 : 400,
            message: result ? 'Result of query fetched successfully' : 'Something went wrong with parameters, Kindly have a look and try again',
            data: result ? result : null
        }
    }


    @ApiBearerAuth(AuthorizationHeader)
    @UseGuards(JWTAuthGuard, RolesGuard)
    @Roles(Role.SUPER_ADMIN, Role.INTERNAL_ADMIN)
    @Get('admins')
    async getCompanyAdmins(@Query('company_id') company_id: string) {
        return await this.companiesService.getCompanyAdminsForCompanyById(company_id)

    }



    @ApiBearerAuth(AuthorizationHeader)
    @UseGuards(JWTAuthGuard)
    @Post()
    @ApiBody({ type: CreateCompanyDto })
    async insert(@Body() body: CreateCompanyDto, @Req() req: Request) {
        const createOption = await this.companiesService.insertCompany(body, req.user);
        return { message: RESOURCE_CREATED, data: createOption };
    }

    @ApiBearerAuth(AuthorizationHeader)
    @UseGuards(JWTAuthGuard)
    @Put()
    @ApiBody({ type: UpdateCompanyDto })
    async update(@Query('id') id: string, @Body() body: UpdateCompanyDto, @Req() req: Request) {
        const createOption = await this.companiesService.updateComapny(id, body, req.user);
        return { message: 'Company updated successfully', data: createOption };
    }

}
