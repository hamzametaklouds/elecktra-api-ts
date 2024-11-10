import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { QueryStatus } from '../queries.schema';

export class UpdateQueryDto {

    @ApiProperty({
        description: 'first_name string e.g first_name=raoarsalanlatif@gmail.com',
        required: true,
        default: '',
    })
    @IsString()
    @IsOptional()
    first_name: string;

    @ApiProperty({
        description: 'last_name string e.g last_name=xyzabc',
        required: true,
        default: '',
    })
    @IsString()
    @IsOptional()
    last_name: string;

    @ApiProperty({
        description: 'email string e.g email=xyzabc',
        required: true,
        default: '',
    })
    @IsString()
    @IsOptional()
    email: string;

    @ApiProperty({
        description: 'query string e.g query=xyzabc',
        required: true,
        default: '',
    })
    @IsString()
    @IsOptional()
    query: string;

    @ApiProperty({
        description: 'query string e.g query=xyzabc',
        required: true,
        default: '',
    })
    @IsEnum(QueryStatus)
    @IsOptional()
    status: string;

}
