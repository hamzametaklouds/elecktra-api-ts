import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteSystemUserDto {

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
    required: false,
    default: '',
  })
  @IsString()
  @IsOptional()
  first_name: string;

  @ApiProperty({
    description: 'last_name string e.g last_name= Charles',
    required: false,
    default: '',
  })
  @IsString()
  @IsOptional()
  last_name: string;

  @ApiProperty({
    description: 'email string e.g last_name= jonathan.charles@gmail.com',
    required: false,
    default: '',
  })
  @IsEmail()
  @IsOptional()
  email: string;

  @ApiProperty({
    description: 'phone_no string e.g phone_no= +(555) 555-1234',
    required: false,
    default: '',
  })
  @IsString()
  @IsOptional()
  phone_no: string;


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

}
