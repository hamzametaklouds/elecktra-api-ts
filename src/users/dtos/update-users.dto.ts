import { ObjectId } from 'mongoose';
import { IsMongoId, IsBoolean, IsOptional, IsString, IsEnum, IsArray, IsEmail, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {

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
  @IsOptional()
  first_name: string;

  @ApiProperty({
    description: 'sure_name string e.g sure_name= Charles',
    required: true,
    default: '',
  })
  @IsString()
  @IsOptional()
  sur_name: string;

  @ApiProperty({
    description: 'fcm_token string e.g fcm_token= Charles',
    required: true,
    default: '',
  })
  @IsString()
  @IsOptional()
  fcm_token: string;

  @ApiProperty({
    description: 'email string e.g last_name= jonathan.charles@gmail.com',
    required: true,
    default: '',
  })
  @IsEmail()
  @IsOptional()
  email: string;

  @ApiProperty({
    description: 'phone_no string e.g phone_no= +(555) 555-1234',
    required: true,
    default: '',
  })
  @IsString()
  @IsOptional()
  phone_no: string;

  @ApiProperty({
    description: 'password string e.g password= xyz123',
    required: true,
    default: '',
  })
  @IsString()
  @IsOptional()
  password: string;

  @ApiProperty({
    description: 'finger_print_enabled boolean e.g finger_print_enabled=true',
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  finger_print_enabled?: boolean;

  @ApiProperty({
    description: 'is_disabled boolean e.g is_disabled=true',
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  is_disabled?: boolean;

  @ApiProperty({
    description: 'is_deleted boolean e.g is_deleted=true',
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  is_deleted?: boolean;

  @ApiProperty({
    description: 'updated_by mongo id',
    required: false,
    default: false,
  })
  @IsMongoId()
  @IsOptional()
  updated_by?: ObjectId;

  
  
}
