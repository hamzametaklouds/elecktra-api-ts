import { ObjectId } from 'mongoose';
import { IsMongoId, IsBoolean, IsOptional, IsString, IsEnum, IsArray, IsEmail, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from 'src/roles/roles.schema';

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
  last_name: string;

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
    description: 'country_code string e.g country_code= +(555)',
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

  @ApiProperty({
    description: 'gender string e.g gender= +(555) 555-1234',
    required: true,
    default: '',
  })
  @IsString()
  @IsOptional()
  gender: string;

  @ApiProperty({
    description: 'phone_no string e.g phone_no= +(555) 555-1234',
    required: true,
    default: '',
  })
  @IsString()
  @IsOptional()
  biography: string;

  @ApiProperty({
    description: 'emergency_contact string e.g emergency_contact= +(555) 555-1234',
    required: true,
    default: '',
  })
  @IsString()
  @IsOptional()
  emergency_contact: string;

  @ApiProperty({
    description: 'country string e.g country= +(555) 555-1234',
    required: true,
    default: '',
  })
  @IsString()
  @IsOptional()
  country: string;

  @ApiProperty({
    description: 'street string e.g street= +(555) 555-1234',
    required: true,
    default: '',
  })
  @IsString()
  @IsOptional()
  street: string;

  @ApiProperty({
    description: 'suite string e.g suite= +(555) 555-1234',
    required: true,
    default: '',
  })
  @IsString()
  @IsOptional()
  suite: string;

  @ApiProperty({
    description: 'city string e.g city= +(555) 555-1234',
    required: true,
    default: '',
  })
  @IsString()
  @IsOptional()
  city: string;

  @ApiProperty({
    description: 'post_code string e.g post_code= +(555) 555-1234',
    required: true,
    default: '',
  })
  @IsString()
  @IsOptional()
  post_code: string;


  @ApiProperty({
    description: 'dob string e.g dob= +(555) 555-1234',
    required: true,
    default: '',
  })
  @IsString()
  @IsOptional()
  dob: string;


  @ApiProperty({
    description: 'is_disabled boolean e.g is_deleted=true',
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
    description: 'User roles array',
    required: false,
    enum: Role,
    isArray: true
  })
  @IsEnum(Role)
  @IsOptional()
  role?: string;

}
