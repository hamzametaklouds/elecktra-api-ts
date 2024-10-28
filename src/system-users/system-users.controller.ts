import { Controller, Get, Post, Put, Query, Body, ValidationPipe, UsePipes, UseFilters, UseInterceptors, Headers, UseGuards } from '@nestjs/common';
import { HttpExceptionFilter } from 'src/app/filters/http-exception.filter';
import getMessages from 'src/app/api-messages';
import { QueryParamsDTO } from 'src/app/dtos/query-params.dto';
import { ApiBearerAuth, ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { IPaginationQuery } from 'src/app/interfaces';
import { ParamsHandler } from 'src/app/custom-decorators/params-handler.decorator';
import { SystemUsersService } from './system-users.service';
import { JWTAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { AuthorizationHeader } from 'src/app/swagger.constant';
import { CreateSystemUserDto } from './dtos/create-system-users.dto';

const { RESOURCE_CREATED } = getMessages('user(s)');

UseFilters(HttpExceptionFilter);

@Controller('system-users')
@ApiTags('system-users')
export class SystemUsersController {
  constructor(private systemUserService: SystemUsersService) { }

  // /**
  //  * The purpose of this method is to return user either paginated or filtered based on the query received
  //  * @param pagination receives pagination query as an argument that might contain $rpp, page number, order etc
  //  * @returns the users based on the query arguments received
  //  * if ($rpp, $page) are received then paginated users grouped by specified attributes would be returned
  //  * or else filtered users will be returned
  //  */
  // @ApiBearerAuth(AuthorizationHeader)
  // @UseGuards(JWTAuthGuard)
  // @Get()
  // @ApiQuery({ type: QueryParamsDTO })
  // async get(@ParamsHandler() pagination: IPaginationQuery) {
  //   const { $rpp, $page, $filter, $orderBy } = pagination;
  //   if ($rpp && $page) {
  //     const result= await this.systemUserService.getPaginatedUsers($rpp, $page, $filter, $orderBy);
  //     return {
  //       status:result?true:false,
  //       statusCode:result?200:400,
  //       message:result?'Result of query fetched successfully':'Something went wrong with parameters, Kindly have a look and try again',
  //       data:result?result:null
  //   }
  //   }
  //   const result=await this.systemUserService.getFilteredUsers($filter, $orderBy)
  //   return {
  //     status:result?true:false,
  //     statusCode:result?200:400,
  //     message:result?'Result of query fetched successfully':'Something went wrong with parameters, Kindly have a look and try again',
  //     data:result?result:null
  // }

  // }

  @Post('sign-up')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiBody({ type: CreateSystemUserDto })
  async insert(@Body() body: CreateSystemUserDto) {
    const createdUser = await this.systemUserService.insertUser(body);
    return createdUser;
  }


}
