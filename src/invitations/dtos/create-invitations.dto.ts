import { IsBoolean, IsEmail, IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'mongoose';
import { Role } from 'src/roles/roles.schema';

export class CreateInvitationDto {

  @ApiProperty({
    description: 'email string e.g email= jonathan.charles@carnivalist.com',
    required: true,
    default: '',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'role string e.g role=624ea2841cd832e0db8466da',
    required: false,
    default: null,
  })
  @IsEnum(Role)
  role?: string;

}

