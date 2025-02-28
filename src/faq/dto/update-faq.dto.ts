import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateFaqDto } from './create-faq.dto';
import { IsNumber, IsOptional } from 'class-validator';

export class UpdateFaqDto extends PartialType(CreateFaqDto) {

} 