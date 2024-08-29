import { IsEmail,IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';


export class LoginDto {

  @ApiProperty({
    description: 'email string e.g email=jonathan.charles@voyagevite.com',
    required: true,
    default: 'xyz@voyagevite.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'password string e.g password=xyz123',
    required: true,
    default: 'xyz123',
  })
  @IsString()
  password: string;

}
