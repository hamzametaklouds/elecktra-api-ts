import { Controller, Post, Body, ValidationPipe, UsePipes, UseFilters, UseInterceptors, Headers, UseGuards, Get, Req } from '@nestjs/common';
import { HttpExceptionFilter } from 'src/app/filters/http-exception.filter';
import getMessages from 'src/app/api-messages';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { SystemUsersService } from './system-users.service';
import { CreateSystemUserDto } from './dtos/create-system-users.dto';
import { AuthorizationHeader } from 'src/app/swagger.constant';
import { JWTAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { Request } from 'express';

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


  @ApiBearerAuth(AuthorizationHeader)
  @UseGuards(JWTAuthGuard)
  @Get('internal-admins')
  async get(@Req() req: Request) {
    return await this.systemUserService.getUserData(req.user)
  }


  @Post('sign-up')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiBody({ type: CreateSystemUserDto })
  async insert(@Body() body: CreateSystemUserDto) {
    const createdUser = await this.systemUserService.insertUser(body);
    return createdUser;
  }


}
