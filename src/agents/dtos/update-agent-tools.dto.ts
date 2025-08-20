import { IsArray, IsMongoId, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAgentToolsDto {
  @ApiProperty({
    description: 'Array of selected tool IDs (max 24)',
    required: true,
    type: [String],
    example: ['60f7b3b3b3b3b3b3b3b3b3b3', '60f7b3b3b3b3b3b3b3b3b3b4']
  })
  @IsArray()
  @IsMongoId({ each: true })
  @MaxLength(24, { message: 'Maximum 24 tools allowed' })
  tools_selected: string[];
}