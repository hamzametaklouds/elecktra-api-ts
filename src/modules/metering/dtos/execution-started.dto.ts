import { IsString, IsIn } from 'class-validator';

export class ExecutionStartedDto {
  @IsIn(['execution.started']) 
  event_type: 'execution.started';
  
  @IsString() 
  agent_id: string;
}
