import {IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddContactDto {

  @ApiProperty({
    description: 'phone_no string e.g phone_no= +923409566404',
    required: true,
    default: '',
  })
  @IsString()
  phone_no: string;

  @ApiProperty({
    description: 'relationship string e.g relationship= abc',
    required: true,
    default: '',
  })
  @IsString()
  relationship: string;

  @ApiProperty({
    description: 'name string e.g name= abc',
    required: true,
    default: '',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'address string e.g address= abc',
    required: true,
    default: '',
  })
  @IsString()
  address: string;
  
  
}