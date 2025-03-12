import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Req, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
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

@ApiTags('company')
@Controller('company')
@UseGuards(JWTAuthGuard, RolesGuard)
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

//   @Post()
//   @ApiBearerAuth('access-token')
//   @Roles(Role.SUPER_ADMIN, Role.BUSINESS_ADMIN)
//   @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
//   async create(@Body() createCompanyDto: CreateCompanyDto, @Req() req: Request) {
//     const company = await this.companyService.create(createCompanyDto, req.user);
//     return {
//       status: true,
//       statusCode: 201,
//       message: 'Company created successfully',
//       data: company,
//     };
//   }

  @Get()
  @ApiBearerAuth(AuthorizationHeader)
  @UseGuards(JWTAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.BUSINESS_ADMIN)
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
  @Roles(Role.SUPER_ADMIN, Role.BUSINESS_ADMIN)
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
  @Roles(Role.SUPER_ADMIN)
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
  @Roles(Role.SUPER_ADMIN)
  async remove(@Param('id') id: string) {
    await this.companyService.remove(id);
    return {
      status: true,
      statusCode: 200,
      message: 'Company deleted successfully',
    };
  }

  @Get('my-company')
  @ApiBearerAuth(AuthorizationHeader)
  @UseGuards(JWTAuthGuard)
  async getMyCompany(@Req() req: Request) {
    const company = await this.companyService.findByUserId(req.user);
    return {
      status: true,
      statusCode: 200,
      message: 'Company retrieved successfully',
      data: company,
    };
  }
} 