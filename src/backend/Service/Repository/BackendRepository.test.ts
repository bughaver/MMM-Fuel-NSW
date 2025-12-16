import { BackendRepository } from './BackendRepository';
import { BackendMapper } from './Mapper/BackendMapper';
import { FuelApiConnector } from './Connector/FuelApiConnector';
import { Config } from '../../../types/Config';
import { ReferenceData } from '../../BackendTypes';

function createDefaultConfig(overrides: Partial<Config> = {}): Config {
  return {
    fuelType: 'P95',
    brands: [],
    radius: 3,
    sortBy: 'price',
    limit: 3,
    distance: 10,
    updateIntervalInSeconds: 600,
    maxWidth: '100%',
    showDistance: true,
    showAddress: true,
    showLogo: true,
    showOpenStatus: true,
    showFuelType: true,
    borderStyle: 'all',
    showLastUpdate: true,
    displayMode: 'list',
    alignment: 'center',
    lat: -33.8688,
    long: 151.2093,
    ...overrides,
  };
}

describe('BackendRepository', () => {
  let repository: BackendRepository;
  let mockFuelApiConnector: jest.Mocked<FuelApiConnector>;

  const mockConfig: Config = createDefaultConfig({
    fuelType: 'P95-P98',
    lat: -33.93993412910857,
    long: 151.1270892114922,
    showAddress: false,
    showFuelType: false,
    borderStyle: 'individual',
    showLastUpdate: false,
  });

  const mockRefData: ReferenceData = {
    brands: {
      items: [
        { description: 'BP', isactive: true, logoimageurl: 'bp.png' },
        { description: 'Shell', isactive: true, logoimageurl: 'shell.png' },
      ],
    },
    fueltypes: {
      items: [{ code: 'P95-P98', isactive: true }],
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockFuelApiConnector = {
      fetchReferenceData: jest.fn().mockResolvedValue(mockRefData),
      fetchFuelStationsByLocation: jest.fn().mockResolvedValue([
        {
          Name: 'BP Ulladulla',
          Brand: 'BP',
          Address: '155-157 Princes Highway, Ulladulla NSW 2539',
          Price: 200,
          Distance: 1.0,
          FuelType: 'P95',
          Day: 'SATURDAY',
          tradinghours: [],
        },
        {
          Name: 'Shell Milton',
          Brand: 'Shell',
          Address: 'Corner Princes Highway & Croobyar Road, Milton NSW 2538',
          Price: 195,
          Distance: 2.0,
          FuelType: 'P95',
          Day: 'SATURDAY',
          tradinghours: [],
        },
      ]),
    } as unknown as jest.Mocked<FuelApiConnector>;

    const backendMapper = new BackendMapper();
    repository = new BackendRepository(backendMapper, mockFuelApiConnector);
  });

  describe('getFuelStations', () => {
    test('applies limit filter correctly', async () => {
      const configWithLimit = { ...mockConfig, limit: 1 };

      const result = await repository.getFuelStations(configWithLimit);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Shell Milton');
    });

    test('applies distance filter correctly', async () => {
      const configWithDistance = { ...mockConfig, distance: 1.5 };

      const result = await repository.getFuelStations(configWithDistance);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('BP Ulladulla');
    });

    test('skips limit filter when limit is undefined', async () => {
      const configWithoutLimit = { ...mockConfig, limit: undefined } as unknown as Config;

      const result = await repository.getFuelStations(configWithoutLimit);

      expect(result).toHaveLength(2); // All stations returned since no limit
    });

    test('skips distance filter when distance is undefined', async () => {
      const configWithoutDistance = { ...mockConfig, distance: undefined } as unknown as Config;

      const result = await repository.getFuelStations(configWithoutDistance);

      expect(result).toHaveLength(2); // All stations returned since no distance filter
    });

    test('sorts by price ascending', async () => {
      const result = await repository.getFuelStations(mockConfig);

      expect(result).toHaveLength(2);
      expect(result[0].price).toBe(195);
      expect(result[1].price).toBe(200);
    });

    test('sorts by distance ascending', async () => {
      const configSortByDistance: Config = { ...mockConfig, sortBy: 'distance' };

      const result = await repository.getFuelStations(configSortByDistance);

      expect(result).toHaveLength(2);
      expect(result[0].distance).toBe(1.0);
      expect(result[1].distance).toBe(2.0);
    });

    test('filters by brands correctly', async () => {
      const configWithBrands = { ...mockConfig, brands: ['BP'] };

      const result = await repository.getFuelStations(configWithBrands);

      expect(result).toHaveLength(1);
      expect(result[0].brand).toBe('BP');
    });

    test('calls connector methods correctly', async () => {
      await repository.getFuelStations(mockConfig);

      expect(mockFuelApiConnector.fetchReferenceData).toHaveBeenCalledTimes(1);
      expect(mockFuelApiConnector.fetchFuelStationsByLocation).toHaveBeenCalledTimes(1);
      expect(mockFuelApiConnector.fetchFuelStationsByLocation).toHaveBeenCalledWith(
        'P95-P98',
        ['SelectAll'],
        expect.any(Object),
      );
    });
  });

  describe('getReferenceData', () => {
    test('returns reference data from connector', async () => {
      const result = await repository.getReferenceData();

      expect(result).toBe(mockRefData);
      expect(mockFuelApiConnector.fetchReferenceData).toHaveBeenCalledTimes(1);
    });

    test('calls connector method when invoked', async () => {
      await repository.getReferenceData();
      await repository.getReferenceData();

      expect(mockFuelApiConnector.fetchReferenceData).toHaveBeenCalledTimes(2);
    });
  });

  describe('fetchFuelStations', () => {
    test('passes brands array when config.brands is defined', async () => {
      const configWithBrands = { ...mockConfig, brands: ['BP', 'Shell'] };

      await repository.getFuelStations(configWithBrands);

      expect(mockFuelApiConnector.fetchFuelStationsByLocation).toHaveBeenCalledWith(
        'P95-P98',
        ['BP', 'Shell'],
        expect.any(Object),
      );
    });
  });

  describe('error handling', () => {
    test('propagates connector errors', async () => {
      const error = new Error('API Error');
      mockFuelApiConnector.fetchReferenceData.mockRejectedValue(error);
      mockFuelApiConnector.fetchFuelStationsByLocation.mockRejectedValue(error);

      await expect(repository.getFuelStations(mockConfig)).rejects.toThrow('API Error');
    });
  });
});
