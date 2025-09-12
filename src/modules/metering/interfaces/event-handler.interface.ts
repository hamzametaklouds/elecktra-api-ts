import { KpiType } from '../enums/kpi-type.enum';
import { GraphType } from '../enums/graph-type.enum';

export interface IEventHandlerService {
  getKpiType(agent_id: string, kpi_key: string): Promise<{ key: string; type: KpiType; graph_type?: GraphType } | undefined>;
  handle(evt: any, trace_id?: string): Promise<any>;
}
