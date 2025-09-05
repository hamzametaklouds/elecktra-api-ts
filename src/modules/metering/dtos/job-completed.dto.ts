import { IsString, IsIn, IsNumber } from 'class-validator';

export class JobCompletedDto {
  @IsIn(['job.completed']) 
  event_type: 'job.completed';
  
  @IsString() 
  agent_id: string;
  
  @IsNumber() 
  kpi_key: number; // will be coerced to string internally
  
  @IsNumber() 
  value: number;
}
