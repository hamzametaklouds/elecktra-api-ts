import {IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RemoveContactDto {

  @ApiProperty({
    description: 'phone_no string e.g phone_no= +923409566404',
    required: true,
    default: '',
  })
  @IsString()
  phone_no: string;
  
}