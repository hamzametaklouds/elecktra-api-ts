import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateQueryDto {

    @ApiProperty({
        description: 'first_name string e.g first_name=raoarsalanlatif@gmail.com',
        required: true,
        default: '',
    })
    @IsString()
    first_name: string;

    @ApiProperty({
        description: 'last_name string e.g last_name=xyzabc',
        required: true,
        default: '',
    })
    @IsString()
    last_name: string;

    @ApiProperty({
        description: 'email string e.g email=xyzabc',
        required: true,
        default: '',
    })
    @IsString()
    email: string;

    @ApiProperty({
        description: 'is_deleted boolean e.g is_deleted=true',
        required: false,
        default: false,
    })
    @IsBoolean()
    @IsOptional()
    is_mobile?: boolean;

    @ApiProperty({
        description: 'query string e.g query=xyzabc',
        required: true,
        default: '',
    })
    @IsString()
    query: string;

}
