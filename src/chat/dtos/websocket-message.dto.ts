import { ApiProperty } from '@nestjs/swagger';
import { CreateMessageDto } from './create-message.dto';
import { IsString, IsObject } from 'class-validator';

export class JoinRoomDto {
  @ApiProperty({ description: 'Company ID to join the room' })
  @IsString()
  companyId: string;
}

export class WebSocketUserDto {
  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty()
  @IsString()
  company_id: string;
}

export class WebSocketMessageDto extends CreateMessageDto {
  @ApiProperty({ type: WebSocketUserDto })
  @IsObject()
  user: WebSocketUserDto;
}

export class EditMessageDto {
  @ApiProperty()
  @IsString()
  messageId: string;

  @ApiProperty()
  @IsString()
  content: string;

  @ApiProperty({ type: WebSocketUserDto })
  @IsObject()
  user: WebSocketUserDto;
}

export class DeleteMessageDto {
  @ApiProperty()
  @IsString()
  messageId: string;

  @ApiProperty({ type: WebSocketUserDto })
  @IsObject()
  user: WebSocketUserDto;
} 