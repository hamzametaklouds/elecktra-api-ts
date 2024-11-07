import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';


export class UpdateCompanyDto {

    @ApiProperty({
        description: 'title string e.g title=raoarsalanlatif@gmail.com',
        required: true,
        default: '',
    })
    @IsString()
    @IsOptional()
    title: string;

    @ApiProperty({
        description: 'description string e.g description=xyzabc',
        required: true,
        default: '',
    })
    @IsString()
    @IsOptional()
    description: string;

    @ApiProperty({
        description: 'icon string e.g icon=xyzabc',
        required: true,
        default: '',
    })
    @IsString()
    @IsOptional()
    icon: string;


    @ApiProperty({
        description: 'is_disabled boolean e.g is_deleted=true',
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
