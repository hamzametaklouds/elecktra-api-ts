import { Controller, Put, Body, ValidationPipe, UsePipes, UseFilters, UseGuards, Req, Get, Query } from '@nestjs/common';
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
import { UpdateHostDto } from './dtos/update-host.dto';


UseFilters(HttpExceptionFilter);


@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(private userService: UsersService) { }

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
  @Roles(Role.SUPER_ADMIN, Role.INTERNAL_ADMIN)
  @Get('list')
  @ApiQuery({ type: QueryParamsDTO })
  async getUserList(@ParamsHandler() pagination: IPaginationQuery) {
    const { $rpp, $page, $filter, $orderBy } = pagination;
    if ($rpp && $page) {
      const result = await this.userService.getPaginatedUsers($rpp, $page, $filter, $orderBy);
      return {
        status: result ? true : false,
        statusCode: result ? 200 : 400,
        message: result ? 'Result of query fetched successfully' : 'Something went wrong with parameters, Kindly have a look and try again',
        data: result ? result : null
      }
    }
    const result = await this.userService.getFilteredUsers($filter, $orderBy);
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
  @Get('hosts')
  @ApiQuery({ type: QueryParamsDTO })
  async getHostUserList(@ParamsHandler() pagination: IPaginationQuery) {
    const { $rpp, $page, $filter, $orderBy } = pagination;
    if ($rpp && $page) {
      const result = await this.userService.getPaginatedHostUsers($rpp, $page, $filter, $orderBy);
      return {
        status: result ? true : false,
        statusCode: result ? 200 : 400,
        message: result ? 'Result of query fetched successfully' : 'Something went wrong with parameters, Kindly have a look and try again',
        data: result ? result : null
      }
    }
    const result = await this.userService.getFilteredHostUsers($filter, $orderBy);
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
  @Roles(Role.SUPER_ADMIN)
  @Put()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiBody({ type: UpdateUserDto })
  async update(@Query('id') id: string, @Body() body: UpdateUserDto, @Req() req: Request) {

    const user = await this.userService.updateUser(id, body, req.user);
    return user;
  }

  @ApiBearerAuth(AuthorizationHeader)
  @UseGuards(JWTAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Put('host')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiBody({ type: UpdateHostDto })
  async updateHost(@Query('id') id: string, @Body() body: UpdateHostDto, @Req() req: Request) {
    const user = await this.userService.updateHostUser(id, body, req.user);
    return user;
  }


  @ApiBearerAuth(AuthorizationHeader)
  @UseGuards(JWTAuthGuard, RolesGuard)
  @Put('mobile')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiBody({ type: UpdateUserDto })
  async updateMobileUser(@Body() body: UpdateUserDto, @Req() req: Request) {

    const user = await this.userService.updateUserMobile(body, req.user);
    return user;
  }

  //   /**
  //  * The purpose of this method is to update user
  //  * @param Id receives the id of the user that we want to update as an argument
  //  * @param body of the user object of type UpdateUserDto as an argument
  //  * @returns the updated user object and success message
  //  */
  //   @ApiBearerAuth(AuthorizationHeader)
  //   @UseGuards(JWTAuthGuard)
  //   @Post('add-emergency-contact')
  //   @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  //   @ApiBody({ type: AddContactDto })
  //   async addEmergencyContact(@Query('user_id') datasetId: string, @Body() body: AddContactDto) {

  //     const user = await this.userService.pushContacts(datasetId, body);
  //     return user;
  //   }

  //   /**
  // * The purpose of this method is to update user
  // * @param Id receives the id of the user that we want to update as an argument
  // * @param body of the user object of type UpdateUserDto as an argument
  // * @returns the updated user object and success message
  // */
  //   @ApiBearerAuth(AuthorizationHeader)
  //   @UseGuards(JWTAuthGuard)
  //   @Post('remove-emergency-contact')
  //   @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  //   @ApiBody({ type: RemoveContactDto })
  //   async removeEmergencyContact(@Query('user_id') datasetId: string, @Body() body: RemoveContactDto) {

  //     const user = await this.userService.pullContacts(datasetId, body);
  //     return user;
  //   }
}
