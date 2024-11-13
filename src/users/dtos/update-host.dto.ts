import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { HostStatus } from '../users.schema';

export class UpdateHostDto {


  @ApiProperty({
    description: 'fcm_token string e.g fcm_token= Charles',
    required: true,
    default: '',
  })
  @IsEnum(HostStatus)
  status: string;


}
