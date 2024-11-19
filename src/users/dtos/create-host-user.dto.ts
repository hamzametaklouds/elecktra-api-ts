import { IsOptional, IsString, IsEmail, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { HostType } from '../users.schema';

export class CreateHostUserDto {

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
    description: 'for_stay boolean e.g for_stay=true',
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  for_stay?: boolean;

  @ApiProperty({
    description: 'for_car boolean e.g for_car=true',
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  for_car?: boolean;

  @ApiProperty({
    description: 'country_code string e.g country_code= +2',
    required: true,
    default: '',
  })
  @IsString()
  country_code: string;

  @ApiProperty({
    description: 'phone_no string e.g phone_no= +(555) 555-1234',
    required: true,
    default: '',
  })
  @IsString()
  phone_no: string;

  @ApiProperty({
    description: 'phone_no string e.g phone_no= +(555) 555-1234',
    required: true,
    default: '',
  })
  @IsString()
  address: string;


}
