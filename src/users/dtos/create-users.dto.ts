import { ObjectId } from 'mongoose';
import { IsMongoId, IsBoolean, IsOptional, IsString, IsEnum, IsArray, IsEmail, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {

  @ApiProperty({
    description: 'image string e.g image= xyz.png',
    required: true,
    default: '',
  })
  @IsString()
  @IsOptional()
  image: string;

  @ApiProperty({
    description: 'first_name string e.g first_name= Jonathan Charles',
    required: true,
    default: '',
  })
  @IsString()
  first_name: string;

  @ApiProperty({
    description: 'sure_name string e.g sure_name= Charles',
    required: true,
    default: '',
  })
  @IsString()
  last_name: string;

  @ApiProperty({
    description: 'email string e.g last_name= jonathan.charles@gmail.com',
    required: true,
    default: '',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'uuid string e.g uuid= ',
    required: true,
    default: '',
  })
  @IsString()
  uuid: string;

  @ApiProperty({
    description: 'dob string e.g dob= ',
    required: true,
    default: '',
  })
  @IsString()
  @IsOptional()
  dob: string;

  @ApiProperty({
    description: 'country_code string e.g country_code= +2',
    required: true,
    default: '',
  })
  @IsString()
  @IsOptional()
  country_code: string;

  @ApiProperty({
    description: 'phone_no string e.g phone_no= +(555) 555-1234',
    required: true,
    default: '',
  })
  @IsString()
  @IsOptional()
  phone_no: string;



}
