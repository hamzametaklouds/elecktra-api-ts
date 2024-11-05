import { Controller, Get, Post, Put, Query, Body, ValidationPipe, UsePipes, UseFilters, UseInterceptors, Headers, UseGuards, Param, Req } from '@nestjs/common';
import { HttpExceptionFilter } from 'src/app/filters/http-exception.filter';
import getMessages from 'src/app/api-messages';
import { ApiBearerAuth, ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { IPaginationQuery } from 'src/app/interfaces';
import { InvitationsService } from './invitations.service';
import { CreateInvitationDto } from './dtos/create-invitations.dto';
import { AuthorizationHeader } from 'src/app/swagger.constant';
import { JWTAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { QueryParamsDTO } from 'src/app/dtos/query-params.dto';
import { ParamsHandler } from 'src/app/custom-decorators/params-handler.decorator';
import { Request } from 'express';
import { Roles } from 'src/app/dtos/roles-decorator';
import { Role } from 'src/roles/roles.schema';
import { RolesGuard } from 'src/app/guards/role-guard';
import { ValidateInvitationDto } from './dtos/validate-invitation.dto';

UseFilters(HttpExceptionFilter);
@Controller('invitations')
@ApiTags('invitations')
export class InvitationsController {
  constructor(private invitationService: InvitationsService) { }

  /**
   * The purpose of this method is to return invitation either paginated or filtered based on the query received
   * @param pagination receives pagination query as an argument that might contain $rpp, page number, order etc
   * @returns the invitations based on the query arguments received
   * if ($rpp, $page) are received then paginated invitations grouped by specified attributes would be returned
   * or else filtered invitations will be returned
   */
  @ApiBearerAuth(AuthorizationHeader)
  @UseGuards(JWTAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Get()
  @ApiQuery({ type: QueryParamsDTO })
  async get(@ParamsHandler() pagination: IPaginationQuery) {

    const { $rpp, $page, $filter, $orderBy } = pagination;
    if ($rpp && $page) {
      const result = await this.invitationService.getPaginatedInvitations($rpp, $page, $filter, $orderBy);

      return {
        status: result ? true : false,
        statusCode: result ? 200 : 400,
        message: result ? 'Result of query fetched successfully' : 'Something went wrong with parameters, Kindly have a look and try again',
        data: result ? result : null
      }
    }
    const result = await this.invitationService.getFilteredInvitations($filter, $orderBy)
    return {
      status: result ? true : false,
      statusCode: result ? 200 : 400,
      message: result ? 'Result of query fetched successfully' : 'Something went wrong with parameters, Kindly have a look and try again',
      data: result ? result : null
    }

  }

  /**
   * The purpose of this method is to create invitation
   * @param body receives the body of the type CreateinvitationDto that validates the post request
   * according to the rules defined in validation pipe i.e CreateinvitationDto
   * @returns the created invitation object and success message along with
   */
  @ApiBearerAuth(AuthorizationHeader)
  @UseGuards(JWTAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Post('sent-invitation')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiBody({ type: CreateInvitationDto })
  async insert(@Body() body: CreateInvitationDto, @Req() req: Request) {
    const createdInvitation = await this.invitationService.sendInvitation(body, req.user);
    return createdInvitation;
  }

  /**
   * The purpose of this method is to validate invitation
   * @param body receives the body of the type ValidateInvitationDto that validates the post request
   * according to the rules defined in validation pipe i.e ValidateInvitationDto
   * @returns the validated invitation object and success message along with
   */
  @Post('validate-invitation')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async validate(@Query('invitation_token') link_id: string) {
    const validatedInvitation = await this.invitationService.validateInvitationLink(link_id);
    return validatedInvitation;
  }

}
