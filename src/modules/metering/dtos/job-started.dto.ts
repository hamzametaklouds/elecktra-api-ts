import { IsString, IsIn, IsNumber } from 'class-validator';

export class JobStartedDto {
  @IsIn(['job.started']) 
  event_type: 'job.started';
  
  @IsString() 
  agent_id: string;
  
  @IsNumber() 
  kpi_key: number; // will be coerced to string internally
  
  @IsNumber() 
  value: number;
}
