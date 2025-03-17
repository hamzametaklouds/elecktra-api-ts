import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsMongoId, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { ObjectId } from 'mongoose';

class WorkflowSelectionDto {
  @ApiProperty()
  @IsMongoId()
  workflow_id: ObjectId;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsMongoId({ each: true })
  integration_ids: ObjectId[];
}

export class CreateAgentRequestDto {
  @ApiProperty({default: ''})
  @IsMongoId()
  agent_id: ObjectId;

  @ApiProperty({default:[{workflow_id: '', integration_ids: ['']}], type: [WorkflowSelectionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkflowSelectionDto)
  work_flows: WorkflowSelectionDto[];
} 