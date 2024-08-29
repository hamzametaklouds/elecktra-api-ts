import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';


export class LoginDto {

  @ApiProperty({
    description: 'uuid string e.g uuid=550e8400-e29b-41d4-a716-446655440000',
    required: true,
    default: '',
  })
  @IsString()
  uuid: string;

}
