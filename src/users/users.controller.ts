import { Controller, Put, Body, ValidationPipe, UsePipes, UseFilters, UseGuards, Req, Get, Query, BadRequestException } from '@nestjs/common';
import { HttpExceptionFilter } from 'src/app/filters/http-exception.filter';
import { ApiBearerAuth, ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dtos/update-users.dto';
import { JWTAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { AuthorizationHeader } from 'src/app/swagger.constant';
import { Request } from 'express';
import { QueryParamsDTO } from 'src/app/dtos/query-params.dto';
import { ParamsHandler } from 'src/app/custom-decorators/params-handler.decorator';
import { IPaginationQuery } from 'src/app/interfaces';
import { Roles } from 'src/app/dtos/roles-decorator';
import { Role } from 'src/roles/roles.schema';
import { RolesGuard } from 'src/app/guards/role-guard';
import { DeliveredAgentsService } from 'src/delivered-agents/delivered-agents.service';
import { forwardRef, Inject } from '@nestjs/common';


UseFilters(HttpExceptionFilter);


@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(
    private userService: UsersService,
    @Inject(forwardRef(() => DeliveredAgentsService))
    private deliveredAgentsService: DeliveredAgentsService,
  ) { }

  //   /**
  //    * The purpose of this method is to return user either paginated or filtered based on the query received
  //    * @param pagination receives pagination query as an argument that might contain $rpp, page number, order etc
  //    * @returns the users based on the query arguments received
  //    * if ($rpp, $page) are received then paginated users grouped by specified attributes would be returned
  //    * or else filtered users will be returned
  //    */
  @ApiBearerAuth(AuthorizationHeader)
  @UseGuards(JWTAuthGuard)
  @Get()
  async get(@Req() req: Request) {
    return await this.userService.getUserData(req.user)
  }


  @ApiBearerAuth(AuthorizationHeader)
  @UseGuards(JWTAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN,Role.SUPPORT_ADMIN, Role.BUSINESS_ADMIN, Role.BUSINESS_OWNER)
  @Get('list')
  @ApiQuery({ type: QueryParamsDTO })
  async getUserList(@ParamsHandler() pagination: IPaginationQuery,@Req() req: Request) {
    const { $rpp, $page, $filter, $orderBy } = pagination;
    if ($rpp && $page) {
      const result = await this.userService.getPaginatedUsers($rpp, $page, $filter, $orderBy,req.user);
      return {
        status: result ? true : false,
        statusCode: result ? 200 : 400,
        message: result ? 'Result of query fetched successfully' : 'Something went wrong with parameters, Kindly have a look and try again',
        data: result ? result : null
      }
    }
    const result = await this.userService.getFilteredUsers($filter, $orderBy,req.user);
    return {
      status: result ? true : false,
      statusCode: result ? 200 : 400,
      message: result ? 'Result of query fetched successfully' : 'Something went wrong with parameters, Kindly have a look and try again',
      data: result ? result : null
    }
  }

  @ApiBearerAuth(AuthorizationHeader)
  @UseGuards(JWTAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN,Role.SUPPORT_ADMIN)
  @Get('internal')
  @ApiQuery({ type: QueryParamsDTO })
  async getUserListInternal(@ParamsHandler() pagination: IPaginationQuery,@Req() req: Request) {
    const { $rpp, $page, $filter, $orderBy } = pagination;
    if ($rpp && $page) {
      const result = await this.userService.getPaginatedInternal($rpp, $page, $filter, $orderBy,req.user);
      return {
        status: result ? true : false,
        statusCode: result ? 200 : 400,
        message: result ? 'Result of query fetched successfully' : 'Something went wrong with parameters, Kindly have a look and try again',
        data: result ? result : null
      }
    }
    const result = await this.userService.getFilteredInternal($filter, $orderBy,req.user);
    return {
      status: result ? true : false,
      statusCode: result ? 200 : 400,
      message: result ? 'Result of query fetched successfully' : 'Something went wrong with parameters, Kindly have a look and try again',
      data: result ? result : null
    }
  }




  //   /**
  //   * The purpose of this method is to update user
  //   * @param Id receives the id of the user that we want to update as an argument
  //   * @param body of the user object of type UpdateUserDto as an argument
  //   * @returns the updated user object and success message
  //   */
  @ApiBearerAuth(AuthorizationHeader)
  @UseGuards(JWTAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.BUSINESS_ADMIN, Role.BUSINESS_OWNER,Role.USER,Role.SUPPORT_ADMIN)
  @Put()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiBody({ type: UpdateUserDto })
  async update(@Query('id') id: string, @Body() body: UpdateUserDto, @Req() req: Request) {

    const user = await this.userService.updateUser(id, body, req.user);
    return user;
  }

  @ApiBearerAuth(AuthorizationHeader)
  @UseGuards(JWTAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.BUSINESS_ADMIN, Role.BUSINESS_OWNER, Role.USER, Role.SUPPORT_ADMIN)
  @Get('company-data')
  async getCompanyData(@Req() req: Request) {
 

    const users = await this.userService.getCompanyUsersAndAgents(req.user);
    const deliveredAgents = await this.deliveredAgentsService.getTaggedDeliveredAgents(
     req.user
    );

    // Filter delivered agents to only include required fields
    const filteredDeliveredAgents = deliveredAgents.map(agent => ({
      title: agent.title,
      image: agent.image,
      _id: agent._id
    }));

    return {
      status: true,
      statusCode: 200,
      message: 'Company data fetched successfully',
      data: {
        users,
        deliveredAgents: filteredDeliveredAgents
      }
    };
  }

}
