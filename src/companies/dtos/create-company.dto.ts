import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';


export class CreateCompanyDto {

    @ApiProperty({
        description: 'title string e.g title=raoarsalanlatif@gmail.com',
        required: true,
        default: '',
    })
    @IsString()
    title: string;

    @ApiProperty({
        description: 'description string e.g description=xyzabc',
        required: true,
        default: '',
    })
    @IsString()
    description: string;

    @ApiProperty({
        description: 'icon string e.g icon=xyzabc',
        required: true,
        default: '',
    })
    @IsString()
    @IsOptional()
    icon: string;


}
