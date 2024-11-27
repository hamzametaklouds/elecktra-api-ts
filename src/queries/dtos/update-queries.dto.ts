import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { QueryStatus } from '../queries.schema';
import { PlatformAccessStatus } from 'src/app/global-enums';

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
        description: 'platform_access_status string e.g platform_access_status=xyzabc',
        required: true,
        default: '',
    })
    @IsEnum(PlatformAccessStatus)
    @IsOptional()
    platform_access_status: string;

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

    @ApiProperty({
        description: 'is_deleted boolean e.g is_deleted=true',
        required: false,
        default: false,
    })
    @IsBoolean()
    @IsOptional()
    is_mobile?: boolean;

    @ApiProperty({
        description: 'is_deleted boolean e.g is_deleted=true',
        required: false,
        default: false,
    })
    @IsBoolean()
    @IsOptional()
    is_disabled?: boolean;

    @ApiProperty({
        description: 'is_deleted boolean e.g is_deleted=true',
        required: false,
        default: false,
    })
    @IsBoolean()
    @IsOptional()
    is_deleted?: boolean;

}
