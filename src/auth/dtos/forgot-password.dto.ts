import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';


export class ForgotPasswordDto {

  @ApiProperty({
    description: 'email string e.g email=jonathan.charles@voyagevite.com',
    required: true,
    default: 'xyz@voyagevite.com',
  })
  @IsEmail()
  email: string;

}
