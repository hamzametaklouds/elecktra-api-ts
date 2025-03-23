import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Req, UsePipes, ValidationPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dtos/create-message.dto';
import { JWTAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { RolesGuard } from 'src/app/guards/role-guard';
import { Roles } from 'src/app/dtos/roles-decorator';
import { Role } from 'src/roles/roles.schema';
import { Request } from 'express';
import { AuthorizationHeader } from 'src/app/swagger.constant';

@ApiTags('chats')
@Controller('chats')
@UseGuards(JWTAuthGuard, RolesGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('messages')
  @ApiBearerAuth(AuthorizationHeader)
  @Roles(Role.SUPER_ADMIN, Role.BUSINESS_ADMIN, Role.BUSINESS_OWNER, Role.USER)
  async getMessages(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Req() req: Request
  ) {
    const messages = await this.chatService.getCompanyMessages(req.user, page, limit);
    return {
      status: true,
      statusCode: 200,
      message: 'Messages retrieved successfully',
      data: messages
    };
  }

  @Post('messages')
  @ApiBearerAuth(AuthorizationHeader)
  @Roles(Role.SUPER_ADMIN, Role.BUSINESS_ADMIN, Role.BUSINESS_OWNER, Role.USER)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async createMessage(
    @Body() createMessageDto: CreateMessageDto,
    @Req() req: Request
  ) {
    const message = await this.chatService.createMessage(createMessageDto, req.user);
    return {
      status: true,
      statusCode: 201,
      message: 'Message sent successfully',
      data: message
    };
  }

  @Delete('messages/:messageId')
  @ApiBearerAuth(AuthorizationHeader)
  @Roles(Role.SUPER_ADMIN, Role.BUSINESS_ADMIN, Role.BUSINESS_OWNER, Role.USER)
  async deleteMessage(
    @Param('messageId') messageId: string,
    @Req() req: Request
  ) {
    const message = await this.chatService.deleteMessage(messageId, req.user);
    return {
      status: true,
      statusCode: 200,
      message: 'Message deleted successfully',
      data: message
    };
  }

  @Put('messages/:messageId')
  @ApiBearerAuth(AuthorizationHeader)
  @Roles(Role.SUPER_ADMIN, Role.BUSINESS_ADMIN, Role.BUSINESS_OWNER, Role.USER)
  async editMessage(
    @Param('messageId') messageId: string,
    @Body('content') content: string,
    @Req() req: Request
  ) {
    const message = await this.chatService.editMessage(messageId, content, req.user);
    return {
      status: true,
      statusCode: 200,
      message: 'Message updated successfully',
      data: message
    };
  }
}