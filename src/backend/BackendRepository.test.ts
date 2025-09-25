import { BackendRepository } from './BackendRepository';
import { BackendService } from './BackendService';
import { Config } from '../types/Config';

// Mock BackendService
jest.mock('./BackendService');

function createDefaultConfig(overrides: Partial<Config> = {}): Config {
  return {
    fuelType: 'P95',
    brands: [],
    radius: 3,
    sortBy: 'price',
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
  let mockBackendService: jest.Mocked<BackendService>;

  const mockConfig: Config = createDefaultConfig({
    fuelType: 'P95-P98',
    lat: -33.93993412910857,
    long: 151.1270892114922,
    showAddress: false,
    showFuelType: false,
    borderStyle: 'individual',
    showLastUpdate: false,
  });

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Create mock service
    mockBackendService = {
      baseUrl: 'https://www.fuelcheck.nsw.gov.au/fuel/api/v1/fuel',
      validateConfig: jest.fn(),
      fetchReferenceData: jest.fn(),
      fetchFuelStationsByLocation: jest.fn(),
      getFuelStations: jest.fn(),
    } as unknown as jest.Mocked<BackendService>;

    repository = new BackendRepository(mockBackendService);
  });

  describe('getValidatedFuelStations', () => {
    const mockApiData = [
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
    ];

    const mockRefData = {
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
      mockBackendService.validateConfig.mockResolvedValue({ isValid: true, errors: [] });
      mockBackendService.fetchFuelStationsByLocation.mockImplementation((fuelType, brands) => {
        if (brands && brands.length > 0) {
          // Filter mock data by brands
          const filtered = mockApiData.filter((station) => brands.includes(station.Brand));
          return Promise.resolve(filtered);
        }
        return Promise.resolve(mockApiData);
      });
      mockBackendService.fetchReferenceData.mockResolvedValue(mockRefData);
    });

    test('validates config before processing', async () => {
      await repository.getValidatedFuelStations(mockConfig);

      expect(mockBackendService.validateConfig).toHaveBeenCalledWith(mockConfig);
    });

    test('throws error if config validation fails', async () => {
      mockBackendService.validateConfig.mockResolvedValue({
        isValid: false,
        errors: ['Invalid fuel type'],
      });

      await expect(repository.getValidatedFuelStations(mockConfig)).rejects.toThrow('Invalid fuel type');
    });

    test('fetches fuel stations with correct parameters', async () => {
      await repository.getValidatedFuelStations(mockConfig);

      expect(mockBackendService.fetchFuelStationsByLocation).toHaveBeenCalledWith('P95-P98', [], {
        bottomLeftLatitude: -33.93993412910857 - 3 / 111.0,
        bottomLeftLongitude: 151.1270892114922 - 3 / (111.0 * Math.cos((-33.93993412910857 * Math.PI) / 180)),
        topRightLatitude: -33.93993412910857 + 3 / 111.0,
        topRightLongitude: 151.1270892114922 + 3 / (111.0 * Math.cos((-33.93993412910857 * Math.PI) / 180)),
      });
    });

    test('applies limit filter correctly', async () => {
      const configWithLimit = { ...mockConfig, limit: 1 };

      const result = await repository.getValidatedFuelStations(configWithLimit);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Shell Milton'); // Shell Milton is cheaper (195) so comes first
    });

    test('applies distance filter correctly', async () => {
      const configWithDistance = { ...mockConfig, distance: 1.5 };

      const result = await repository.getValidatedFuelStations(configWithDistance);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('BP Ulladulla'); // Only BP Ulladulla is within 1.5km
    });

    test('sorts by price ascending', async () => {
      const result = await repository.getValidatedFuelStations(mockConfig);

      expect(result).toHaveLength(2);
      expect(result[0].price).toBe(195); // Shell Milton (cheaper)
      expect(result[1].price).toBe(200); // BP Ulladulla (more expensive)
    });

    test('sorts by distance ascending', async () => {
      const configSortByDistance: Config = { ...mockConfig, sortBy: 'distance' };

      const result = await repository.getValidatedFuelStations(configSortByDistance);

      expect(result).toHaveLength(2);
      expect(result[0].distance).toBe(1.0); // BP Ulladulla (closer)
      expect(result[1].distance).toBe(2.0); // Shell Milton (farther)
    });

    test('filters by brands correctly', async () => {
      const configWithBrands = { ...mockConfig, brands: ['BP'] };

      const result = await repository.getValidatedFuelStations(configWithBrands);

      expect(result).toHaveLength(1);
      expect(result[0].brand).toBe('BP');
    });

    test('uses bounding box when provided', async () => {
      const configWithBoundingBox: Config = {
        ...mockConfig,
        lat: undefined,
        long: undefined,
        bottomLeftLatitude: -34,
        bottomLeftLongitude: 150,
        topRightLatitude: -33,
        topRightLongitude: 152,
      };

      await repository.getValidatedFuelStations(configWithBoundingBox);

      expect(mockBackendService.fetchFuelStationsByLocation).toHaveBeenCalledWith('P95-P98', [], {
        bottomLeftLatitude: -34,
        bottomLeftLongitude: 150,
        topRightLatitude: -33,
        topRightLongitude: 152,
      });
    });

    test('throws error when neither lat/long nor bounding box provided', async () => {
      const invalidConfig: Config = {
        ...mockConfig,
        lat: undefined,
        long: undefined,
        bottomLeftLatitude: undefined,
        bottomLeftLongitude: undefined,
        topRightLatitude: undefined,
        topRightLongitude: undefined,
      };

      await expect(repository.getValidatedFuelStations(invalidConfig)).rejects.toThrow(
        'Invalid location configuration: must provide either lat/long or complete bounding box',
      );
    });
  });
});
