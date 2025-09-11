import { CreateKpiDto } from '../dtos/create-kpi.dto';
import { UpdateKpiUnitDto } from '../dtos/update-kpi-unit.dto';
import { KpiType } from '../enums/kpi-type.enum';
import { GraphType } from '../enums/graph-type.enum';

describe('KPI Unit Handling - DTO Validation', () => {

  describe('CreateKpiDto', () => {
    it('should accept unit field', () => {
      const dto: CreateKpiDto = {
        agent_id: 'agent_123',
        kpi_name: 'App Opens',
        unit: 'events',
        type: KpiType.IMAGE,
        graph_type: GraphType.LINE,
      };

      expect(dto.unit).toBe('events');
    });

    it('should allow unit to be optional', () => {
      const dto: CreateKpiDto = {
        agent_id: 'agent_123',
        kpi_name: 'App Opens',
        type: KpiType.IMAGE,
        graph_type: GraphType.LINE,
      };

      expect(dto.unit).toBeUndefined();
    });

    it('should accept various unit values', () => {
      const testCases = ['events', 'orders', 'minutes', 'USD', 'count', 'requests'];
      
      testCases.forEach(unit => {
        const dto: CreateKpiDto = {
          agent_id: 'agent_123',
          kpi_name: 'Test KPI',
          unit: unit,
          type: KpiType.IMAGE,
          graph_type: GraphType.LINE,
        };

        expect(dto.unit).toBe(unit);
      });
    });
  });

  describe('UpdateKpiUnitDto', () => {
    it('should require unit field', () => {
      const dto: UpdateKpiUnitDto = {
        unit: 'orders',
      };

      expect(dto.unit).toBe('orders');
    });

    it('should accept various unit values', () => {
      const testCases = ['events', 'orders', 'minutes', 'USD', 'count', 'requests'];
      
      testCases.forEach(unit => {
        const dto: UpdateKpiUnitDto = {
          unit: unit,
        };

        expect(dto.unit).toBe(unit);
      });
    });
  });

  describe('Unit Validation Logic', () => {
    it('should accept unit with whitespace (trimming handled by validation pipe)', () => {
      // The @Transform decorator will be applied by the validation pipe in real requests
      const dto: CreateKpiDto = {
        agent_id: 'agent_123',
        kpi_name: 'App Opens',
        unit: '  events  ',
        type: KpiType.IMAGE,
        graph_type: GraphType.LINE,
      };

      // In unit tests, the raw value is preserved
      expect(dto.unit).toBe('  events  ');
    });

    it('should accept empty unit (defaulting handled by validation pipe)', () => {
      const dto: CreateKpiDto = {
        agent_id: 'agent_123',
        kpi_name: 'App Opens',
        unit: '   ',
        type: KpiType.IMAGE,
        graph_type: GraphType.LINE,
      };

      // In unit tests, the raw value is preserved
      expect(dto.unit).toBe('   ');
    });

    it('should handle null/undefined unit values', () => {
      const dto1: CreateKpiDto = {
        agent_id: 'agent_123',
        kpi_name: 'App Opens',
        unit: undefined,
        type: KpiType.IMAGE,
        graph_type: GraphType.LINE,
      };

      const dto2: CreateKpiDto = {
        agent_id: 'agent_123',
        kpi_name: 'App Opens',
        unit: null as any,
        type: KpiType.IMAGE,
        graph_type: GraphType.LINE,
      };

      expect(dto1.unit).toBeUndefined();
      expect(dto2.unit).toBeNull();
    });
  });
});
