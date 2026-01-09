import { BackendService } from './BackendService';
import { BackendRepository } from './Repository/BackendRepository';
import { Config } from '../../Types';
import { ReferenceData } from '../BackendTypes';

jest.mock('./Repository/BackendRepository');

describe('BackendService', () => {
  let service: BackendService;
  let mockBackendRepository: jest.Mocked<BackendRepository>;

  const mockConfig: Config = {
    fuelType: 'P95-P98',
    brands: [],
    radius: 3,
    sortBy: 'price',
    limit: 5,
    distance: 10,
    lat: -33.93993412910857,
    long: 151.1270892114922,
    updateIntervalInSeconds: 600,
    showDistance: true,
    showAddress: false,
    showLogo: true,
    showOpenStatus: true,
    showFuelType: false,
    borderStyle: 'individual',
    showLastUpdate: false,
    displayMode: 'list',
    alignment: 'center',
  };

  const mockRefData: ReferenceData = {
    brands: {
      items: [{ description: 'BP', isactive: true, logoimageurl: 'logo.png' }],
    },
    fueltypes: {
      items: [{ code: 'P95-P98', isactive: true }],
    },
  };

  const mockFuelStations = [
    {
      name: 'BP Ulladulla',
      brand: 'BP',
      location: 'Ulladulla',
      address: '155-157 Princes Highway, Ulladulla NSW 2539',
      price: 200,
      distance: 1.0,
      fieldType: 'P95',
      isOpenNow: true,
      isClosingSoon: false,
      logoUrl: 'logo.png',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    mockBackendRepository = {
      getFuelStations: jest.fn().mockResolvedValue(mockFuelStations),
      getReferenceData: jest.fn().mockResolvedValue(mockRefData),
    } as unknown as jest.Mocked<BackendRepository>;

    service = new BackendService(mockBackendRepository);
  });

  describe('validateConfig', () => {
    test('returns valid result for valid config', async () => {
      const result = await service.validateConfig(mockConfig);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(mockBackendRepository.getReferenceData).toHaveBeenCalledTimes(1);
    });

    test('returns invalid result when repository throws error', async () => {
      mockBackendRepository.getReferenceData.mockRejectedValue(new Error('API Error'));

      const result = await service.validateConfig(mockConfig);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('API validation failed: Error: API Error');
    });
  });

  describe('getFuelStations', () => {
    test('validates config and calls repository', async () => {
      const result = await service.getFuelStations(mockConfig);

      expect(result).toEqual(mockFuelStations);
      expect(mockBackendRepository.getReferenceData).toHaveBeenCalledTimes(1);
      expect(mockBackendRepository.getFuelStations).toHaveBeenCalledTimes(1);
      expect(mockBackendRepository.getFuelStations).toHaveBeenCalledWith(mockConfig);
    });

    test('throws error when config validation fails', async () => {
      mockBackendRepository.getReferenceData.mockRejectedValue(new Error('Validation Error'));

      await expect(service.getFuelStations(mockConfig)).rejects.toThrow(
        'Configuration validation failed: API validation failed: Error: Validation Error',
      );
    });

    test('passes through repository results', async () => {
      const customStations = [
        {
          name: 'Custom Station',
          brand: 'Custom',
          location: 'Custom Location',
          address: 'Custom Address',
          price: 150,
          distance: 0.5,
          fieldType: 'P95',
          isOpenNow: false,
          isClosingSoon: true,
          logoUrl: 'custom.png',
        },
      ];

      mockBackendRepository.getFuelStations.mockResolvedValue(customStations);

      const result = await service.getFuelStations(mockConfig);

      expect(result).toEqual(customStations);
    });
  });
});
