import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Req, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dtos/create-company.dto';
import { UpdateCompanyDto } from './dtos/update-company.dto';
import { JWTAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { RolesGuard } from 'src/app/guards/role-guard';
import { Roles } from 'src/app/dtos/roles-decorator';
import { Role } from 'src/roles/roles.schema';
import { ParamsHandler } from 'src/app/custom-decorators/params-handler.decorator';
import { IPaginationQuery } from 'src/app/interfaces';
import { Request } from 'express';
import { AuthorizationHeader } from 'src/app/swagger.constant';
import { QueryParamsDTO } from 'src/app/dtos/query-params.dto';

@ApiTags('company')
@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @ApiBearerAuth(AuthorizationHeader)
  @UseGuards(JWTAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.BUSINESS_ADMIN, Role.BUSINESS_OWNER, Role.USER,Role.SUPPORT_ADMIN)
  @Get('list')
  @ApiQuery({ type: QueryParamsDTO })
  async getUserList(@ParamsHandler() pagination: IPaginationQuery,@Req() req: Request) {
    const { $rpp, $page, $filter, $orderBy } = pagination;
    if ($rpp && $page) {
      const result = await this.companyService.getPaginatedCompanies($rpp, $page, $filter, $orderBy,req.user);
      return {
        status: result ? true : false,
        statusCode: result ? 200 : 400,
        message: result ? 'Result of query fetched successfully' : 'Something went wrong with parameters, Kindly have a look and try again',
        data: result ? result : null
      }
    }
    const result = await this.companyService.getFilteredCompanies($filter, $orderBy,req.user);
    return {
      status: result ? true : false,
      statusCode: result ? 200 : 400,
      message: result ? 'Result of query fetched successfully' : 'Something went wrong with parameters, Kindly have a look and try again',
      data: result ? result : null
    }
  }


  @Get()
  @ApiBearerAuth(AuthorizationHeader)
  @UseGuards(JWTAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.BUSINESS_ADMIN, Role.BUSINESS_OWNER, Role.USER,Role.SUPPORT_ADMIN)
  async findAll(@ParamsHandler() pagination: IPaginationQuery) {
    const { $rpp, $page, $filter, $orderBy } = pagination;
    const result = await this.companyService.findAll($rpp || 10, $page || 1, $filter || {}, $orderBy || { created_at: -1 });
    return {
      status: true,
      statusCode: 200,
      message: 'Companies retrieved successfully',
      data: result,
    };
  }

  @Get(':id')
  @ApiBearerAuth(AuthorizationHeader)
  @UseGuards(JWTAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.BUSINESS_ADMIN, Role.BUSINESS_OWNER, Role.USER,Role.SUPPORT_ADMIN)
  async findOne(@Param('id') id: string) {
    const company = await this.companyService.findOne(id);
    return {
      status: true,
      statusCode: 200,
      message: 'Company retrieved successfully',
      data: company,
    };
  }

  @Put(':id')
  @ApiBearerAuth(AuthorizationHeader)
  @UseGuards(JWTAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.BUSINESS_ADMIN, Role.BUSINESS_OWNER, Role.USER,Role.SUPPORT_ADMIN)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async update(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto) {
    const company = await this.companyService.update(id, updateCompanyDto);
    return {
      status: true,
      statusCode: 200,
      message: 'Company updated successfully',
      data: company,
    };
  }

  @Delete(':id')
  @ApiBearerAuth(AuthorizationHeader)
  @UseGuards(JWTAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.BUSINESS_ADMIN, Role.BUSINESS_OWNER, Role.USER,Role.SUPPORT_ADMIN)
  async remove(@Param('id') id: string) {
    await this.companyService.remove(id);
    return {
      status: true,
      statusCode: 200,
      message: 'Company deleted successfully',
    };
  }
 

} 