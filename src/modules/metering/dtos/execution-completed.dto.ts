import { IsString, IsIn } from 'class-validator';

export class ExecutionCompletedDto {
  @IsIn(['execution.completed']) 
  event_type: 'execution.completed';
  
  @IsString() 
  agent_id: string;
}
