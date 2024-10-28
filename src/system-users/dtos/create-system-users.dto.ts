import { ObjectId } from 'mongoose';
import { IsMongoId, IsBoolean, IsOptional, IsString, IsEnum, IsArray, IsEmail, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSystemUserDto {

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
    description: 'last_name string e.g last_name= Charles',
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
    description: 'phone_no string e.g phone_no= +(555) 555-1234',
    required: true,
    default: '',
  })
  @IsString()
  phone_no: string;

  @ApiProperty({
    description: 'password string e.g password= xyz123',
    required: true,
    default: '',
  })
  @IsString()
  password: string;

  @ApiProperty({
    description: 'invitation_id mongo id e.g invitation_id=624ea2841cd832e0db8466da',
    required: false,
    default: null,
  })
  @IsMongoId()
  @IsOptional()
  invitation_id?: ObjectId;


}
