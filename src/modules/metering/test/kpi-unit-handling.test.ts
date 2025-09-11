import { Test, TestingModule } from '@nestjs/testing';
import { KpiRegistryService } from '../services/kpi-registry.service';
import { KpiManagementController } from '../controllers/kpi-management.controller';
import { CreateKpiDto } from '../dtos/create-kpi.dto';
import { UpdateKpiUnitDto } from '../dtos/update-kpi-unit.dto';
import { KpiType } from '../enums/kpi-type.enum';
import { GraphType } from '../enums/graph-type.enum';

describe('KPI Unit Handling', () => {
  let service: KpiRegistryService;
  let controller: KpiManagementController;
  let mockKpiRegistry: any;
  let mockKpiGraphData: any;

  beforeEach(async () => {
    // Mock the KPI registry model
    mockKpiRegistry = {
      findOneAndUpdate: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
    };

    // Mock the KPI graph data model
    mockKpiGraphData = {
      findOneAndUpdate: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [KpiManagementController],
      providers: [
        KpiRegistryService,
        {
          provide: 'KPI_REGISTRY_MODEL',
          useValue: mockKpiRegistry,
        },
        {
          provide: 'KPI_GRAPH_DATA_MODEL',
          useValue: mockKpiGraphData,
        },
      ],
    }).compile();

    service = module.get<KpiRegistryService>(KpiRegistryService);
    controller = module.get<KpiManagementController>(KpiManagementController);
  });

  describe('createCustomKpi', () => {
    it('should preserve user-specified unit when creating KPI', async () => {
      const createKpiDto: CreateKpiDto = {
        agent_id: 'agent_123',
        kpi_name: 'App Opens',
        unit: 'events',
        type: KpiType.IMAGE,
        graph_type: GraphType.LINE,
      };

      const mockResult = {
        agent_id: 'agent_123',
        kpis: [
          {
            key: '1000',
            title: 'App Opens',
            unit: 'events',
            description: '',
            image: 'https://via.placeholder.com/64x64/4F46E5/FFFFFF?text=KPI',
            type: KpiType.IMAGE,
            graph_type: GraphType.LINE,
          },
        ],
        updated_at: new Date(),
      };

      mockKpiRegistry.findOneAndUpdate.mockResolvedValue(mockResult);

      const result = await service.createCustomKpi(createKpiDto);

      expect(result.kpis[0].unit).toBe('events');
      expect(mockKpiRegistry.findOneAndUpdate).toHaveBeenCalledWith(
        { agent_id: expect.any(Object) },
        {
          agent_id: expect.any(Object),
          kpis: expect.arrayContaining([
            expect.objectContaining({
              unit: 'events',
            }),
          ]),
          updated_at: expect.any(Date),
        },
        { upsert: true, new: true }
      );
    });

    it('should default to "units" when no unit is provided', async () => {
      const createKpiDto: CreateKpiDto = {
        agent_id: 'agent_123',
        kpi_name: 'App Opens',
        // unit not provided
        type: KpiType.IMAGE,
        graph_type: GraphType.LINE,
      };

      const mockResult = {
        agent_id: 'agent_123',
        kpis: [
          {
            key: '1000',
            title: 'App Opens',
            unit: 'units',
            description: '',
            image: 'https://via.placeholder.com/64x64/4F46E5/FFFFFF?text=KPI',
            type: KpiType.IMAGE,
            graph_type: GraphType.LINE,
          },
        ],
        updated_at: new Date(),
      };

      mockKpiRegistry.findOneAndUpdate.mockResolvedValue(mockResult);

      const result = await service.createCustomKpi(createKpiDto);

      expect(result.kpis[0].unit).toBe('units');
    });

    it('should trim whitespace from unit input', async () => {
      const createKpiDto: CreateKpiDto = {
        agent_id: 'agent_123',
        kpi_name: 'App Opens',
        unit: '  events  ',
        type: KpiType.IMAGE,
        graph_type: GraphType.LINE,
      };

      const mockResult = {
        agent_id: 'agent_123',
        kpis: [
          {
            key: '1000',
            title: 'App Opens',
            unit: 'events',
            description: '',
            image: 'https://via.placeholder.com/64x64/4F46E5/FFFFFF?text=KPI',
            type: KpiType.IMAGE,
            graph_type: GraphType.LINE,
          },
        ],
        updated_at: new Date(),
      };

      mockKpiRegistry.findOneAndUpdate.mockResolvedValue(mockResult);

      const result = await service.createCustomKpi(createKpiDto);

      expect(result.kpis[0].unit).toBe('events');
    });
  });

  describe('updateKpiUnit', () => {
    it('should update KPI unit correctly', async () => {
      const agentId = 'agent_123';
      const kpiKey = '1000';
      const newUnit = 'orders';

      const mockRegistry = {
        agent_id: 'agent_123',
        kpis: [
          {
            key: '1000',
            title: 'App Opens',
            unit: 'events',
            description: '',
            image: 'https://via.placeholder.com/64x64/4F46E5/FFFFFF?text=KPI',
            type: KpiType.IMAGE,
            graph_type: GraphType.LINE,
          },
        ],
        updated_at: new Date(),
      };

      mockKpiRegistry.findOne.mockResolvedValue(mockRegistry);
      mockKpiRegistry.findOneAndUpdate.mockResolvedValue({
        ...mockRegistry,
        kpis: [
          {
            ...mockRegistry.kpis[0],
            unit: 'orders',
          },
        ],
      });

      const result = await service.updateKpiUnit(agentId, kpiKey, newUnit);

      expect(result.kpis[0].unit).toBe('orders');
      expect(mockKpiRegistry.findOne).toHaveBeenCalledWith({
        agent_id: expect.any(Object),
      });
    });

    it('should trim whitespace when updating unit', async () => {
      const agentId = 'agent_123';
      const kpiKey = '1000';
      const newUnit = '  orders  ';

      const mockRegistry = {
        agent_id: 'agent_123',
        kpis: [
          {
            key: '1000',
            title: 'App Opens',
            unit: 'events',
            description: '',
            image: 'https://via.placeholder.com/64x64/4F46E5/FFFFFF?text=KPI',
            type: KpiType.IMAGE,
            graph_type: GraphType.LINE,
          },
        ],
        updated_at: new Date(),
      };

      mockKpiRegistry.findOne.mockResolvedValue(mockRegistry);
      mockKpiRegistry.findOneAndUpdate.mockResolvedValue({
        ...mockRegistry,
        kpis: [
          {
            ...mockRegistry.kpis[0],
            unit: 'orders',
          },
        ],
      });

      const result = await service.updateKpiUnit(agentId, kpiKey, newUnit);

      expect(result.kpis[0].unit).toBe('orders');
    });
  });

  describe('controller endpoints', () => {
    it('should return correct unit in create KPI response', async () => {
      const createKpiDto: CreateKpiDto = {
        agent_id: 'agent_123',
        kpi_name: 'App Opens',
        unit: 'events',
        type: KpiType.IMAGE,
        graph_type: GraphType.LINE,
      };

      const mockResult = {
        agent_id: 'agent_123',
        kpis: [
          {
            key: '1000',
            title: 'App Opens',
            unit: 'events',
            description: '',
            image: 'https://via.placeholder.com/64x64/4F46E5/FFFFFF?text=KPI',
            type: KpiType.IMAGE,
            graph_type: GraphType.LINE,
          },
        ],
        updated_at: new Date(),
      };

      mockKpiRegistry.findOneAndUpdate.mockResolvedValue(mockResult);

      const result = await controller.createCustomKpi(createKpiDto);

      expect(result.unit).toBe('events');
    });

    it('should return correct unit in update KPI unit response', async () => {
      const updateKpiUnitDto: UpdateKpiUnitDto = {
        unit: 'orders',
      };

      const agentId = 'agent_123';
      const kpiKey = '1000';

      const mockResult = {
        agent_id: 'agent_123',
        kpis: [
          {
            key: '1000',
            title: 'App Opens',
            unit: 'orders',
            description: '',
            image: 'https://via.placeholder.com/64x64/4F46E5/FFFFFF?text=KPI',
            type: KpiType.IMAGE,
            graph_type: GraphType.LINE,
          },
        ],
        updated_at: new Date(),
      };

      mockKpiRegistry.findOne.mockResolvedValue(mockResult);
      mockKpiRegistry.findOneAndUpdate.mockResolvedValue(mockResult);

      const result = await controller.updateKpiUnit(agentId, kpiKey, updateKpiUnitDto);

      expect(result.unit).toBe('orders');
    });
  });
});
