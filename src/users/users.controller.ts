import { Controller, Put, Body, ValidationPipe, UsePipes, UseFilters, UseGuards, Req, Get } from '@nestjs/common';
import { HttpExceptionFilter } from 'src/app/filters/http-exception.filter';
import getMessages from 'src/app/api-messages';
import { ApiBearerAuth, ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dtos/update-users.dto';
import { JWTAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { AuthorizationHeader } from 'src/app/swagger.constant';
import { Request } from 'express';


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

  //   /**
  //    * The purpose of this method is to create user
  //    * @param body receives the body of the type CreateUserDto that validates the post request
  //    * according to the rules defined in validation pipe i.e CreateUserDto
  //    * @returns the created user object and success message along with
  //    */
  //   @Post('sign-up')
  //   @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  //   @ApiBody({ type: CreateUserDto })
  //   async insert(@Body() body: CreateUserDto) {
  //     const createdUser = await this.userService.insertUser(body);
  //     return createdUser;
  //   }

  //   /**
  //    * The purpose of this method is to create user
  //    * @param body receives the body of the type CreateUserDto that validates the post request
  //    * according to the rules defined in validation pipe i.e CreateUserDto
  //    * @returns the created user object and success message along with
  //    */
  //   @Post('change-password')
  //   @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  //   @ApiBody({ type: ChnagePasswordDto })
  //   async changePassword(@Query('user_id') datasetId: string, @Body() body: ChnagePasswordDto) {
  //     const createdUser = await this.userService.changePassword(datasetId, body);
  //     return createdUser;
  //   }



  //   /**
  //    * The purpose of this method is to create user
  //    * @param body receives the body of the type CreateUserDto that validates the post request
  //    * according to the rules defined in validation pipe i.e CreateUserDto
  //    * @returns the created user object and success message along with
  //    */
  //   @ApiBearerAuth(AuthorizationHeader)
  //   @UseGuards(JWTAuthGuard)
  //   @Get('auth')
  //   @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  //   async auth(@Req() req: Request) {
  //     const createdUser = await this.userService.userData(req.user);
  //     return createdUser;
  //   }

  //   /**
  //   * The purpose of this method is to update user
  //   * @param Id receives the id of the user that we want to update as an argument
  //   * @param body of the user object of type UpdateUserDto as an argument
  //   * @returns the updated user object and success message
  //   */
  @ApiBearerAuth(AuthorizationHeader)
  @UseGuards(JWTAuthGuard)
  @Put()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiBody({ type: UpdateUserDto })
  async update(@Body() body: UpdateUserDto, @Req() req: Request) {

    const user = await this.userService.updateUser(body, req.user);
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
