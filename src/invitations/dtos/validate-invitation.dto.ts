import { ObjectId } from 'mongoose';
import { IsMongoId, IsEnum, IsNumber, IsString, } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ValidateInvitationDto {
  @ApiProperty({
    description: 'link_id string e.g link_id=jwb3jbqk3',
    required: true,
    default: '',
  })
  @IsString()
  link_id: string;

}
