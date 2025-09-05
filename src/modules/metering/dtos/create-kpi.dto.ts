import { IsString } from 'class-validator';

export class CreateKpiDto {
  @IsString() 
  agent_id: string;
  
  @IsString() 
  kpi_name: string;
}
