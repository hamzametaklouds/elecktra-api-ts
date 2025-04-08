import { PartialType } from '@nestjs/swagger';
import { CreateAgentDto } from './create-agent.dto';
import { IsBoolean, IsOptional, IsEnum, IsArray, ValidateNested, IsMongoId, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AgentStatus } from '../agents.schema';
import { ObjectId } from 'mongoose';
import { Type } from 'class-transformer';


class WorkflowDto {

  @ApiProperty()
  @IsMongoId()
  @IsOptional()
  _id?: ObjectId;


  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsNumber()
  price: number;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  is_disabled?: boolean;

  @ApiProperty()
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  integrations?: ObjectId[];

  @ApiProperty()
  @IsNumber()
  weeks: number;

  @ApiProperty()
  @IsNumber()
  installation_price: number;
}

export class UpdateAgentDto extends PartialType(CreateAgentDto) {
  @ApiProperty({
    enum: AgentStatus,
    description: 'Agent status',
    example: AgentStatus.ACTIVE
  })
  @IsEnum(AgentStatus)
  @IsOptional()
  status?: AgentStatus;

  @ApiProperty({ type: [WorkflowDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkflowDto)
  @IsOptional()
  work_flows?: WorkflowDto[];

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  is_disabled?: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  is_deleted?: boolean;
} 