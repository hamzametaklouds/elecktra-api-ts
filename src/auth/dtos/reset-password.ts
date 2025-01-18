import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';


export class ResetPasswordDto {

  @ApiProperty({
    description: 'email string e.g email=jonathan.charles@voyagevite.com',
    required: true,
    default: 'xyz@voyagevite.com',
  })
  @IsEmail()
  email: string

  @ApiProperty({
    description: 'link_id string e.g link_id=jonathan.charles@voyagevite.com',
    required: true,
    default: 'dfknsdfsjdnfisdnfi',
  })
  @IsString()
  link_id: string;


  @ApiProperty({
    description: 'password string e.g password=1234s',
    required: true,
    default: '123456',
  })
  @IsString()
  password: string;

}
