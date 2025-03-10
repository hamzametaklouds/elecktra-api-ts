import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';


export class ForgotPasswordDto {

  @ApiProperty({
    description: 'email string e.g email=jonathan.charles@electra.com',
    required: true,
    default: 'xyz@electra.com',
  })
  @IsEmail()
  email: string;

}
