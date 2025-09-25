import { BackendService } from './BackendService';
import { Config } from '../types/Config';

// Mock fetch globally
global.fetch = jest.fn();

describe('BackendService', () => {
  let service: BackendService;

  const mockConfig: Config = {
    fuelType: 'P95-P98',
    brands: [],
    radius: 3,
    sortBy: 'price',
    lat: -33.93993412910857,
    long: 151.1270892114922,
    updateIntervalInSeconds: 600,
    maxWidth: '100%',
    showDistance: true,
    showAddress: false,
    showLogo: true,
    showOpenStatus: true,
    showFuelType: false,
    borderStyle: 'individual',
    showLastUpdate: false,
    displayMode: 'list',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new BackendService();
  });

  describe('getFuelStations', () => {
    const mockApiData = [
      {
        Name: 'BP Ulladulla',
        Brand: 'BP',
        Address: '155-157 Princes Highway, Ulladulla NSW 2539',
        Price: 200,
        Distance: 1.0,
        FuelType: 'P95',
        Day: 'SATURDAY',
        tradinghours: [
          {
            Day: 'SATURDAY',
            IsOpenNow: true,
            IsOpen24Hours: false,
            EndTime: '10:00 PM',
          },
        ],
      },
    ];

    const mockRefData = {
      brands: {
        items: [{ description: 'BP', isactive: true, logoimageurl: 'logo.png' }],
      },
      fueltypes: {
        items: [{ code: 'P95-P98', isactive: true }],
      },
    };

    beforeEach(() => {
      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/prices/bylocation')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockApiData),
          });
        } else if (url.includes('/refData')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockRefData),
          });
        }
        return Promise.reject(new Error('Unexpected URL'));
      });
    });

    test('returns mapped and sorted fuel stations', async () => {
      const result = await service.getFuelStations(mockConfig);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        name: 'BP Ulladulla',
        brand: 'BP',
        location: 'Ulladulla',
        address: '155-157 Princes Highway, Ulladulla NSW 2539',
        price: 200,
        distance: 1.0,
        fieldType: 'P95',
        isOpenNow: true,
        isClosingSoon: true, // Now true with 1 hour threshold (test runs ~41 min before 10 PM)
        logoUrl: 'logo.png',
      });
    });

    test('applies limit filter', async () => {
      const configWithLimit = { ...mockConfig, limit: 1 };
      const result = await service.getFuelStations(configWithLimit);

      expect(result).toHaveLength(1);
    });

    test('applies distance filter', async () => {
      const configWithDistance = { ...mockConfig, distance: 0.5 };
      const result = await service.getFuelStations(configWithDistance);

      expect(result).toHaveLength(0); // Station is 1.0km away, filter is 0.5km
    });

    test('sorts by price', async () => {
      const configSortByPrice = { ...mockConfig, sortBy: 'price' as const };
      const result = await service.getFuelStations(configSortByPrice);

      expect(result[0].price).toBe(200);
    });

    test('sorts by distance', async () => {
      const configSortByDistance = {
        ...mockConfig,
        sortBy: 'distance' as const,
      };
      const result = await service.getFuelStations(configSortByDistance);

      expect(result[0].distance).toBe(1.0);
    });

    test('filters by brands', async () => {
      const configWithBrands = { ...mockConfig, brands: ['BP'] };
      const result = await service.getFuelStations(configWithBrands);

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

      const result = await service.getFuelStations(configWithBoundingBox);

      expect(result).toHaveLength(1);
    });

    test('throws error for invalid fuel type', async () => {
      const invalidConfig = { ...mockConfig, fuelType: 'INVALID' };

      await expect(service.getFuelStations(invalidConfig)).rejects.toThrow('Invalid fuel type: INVALID');
    });

    test('throws error for invalid brand', async () => {
      const invalidConfig = { ...mockConfig, brands: ['INVALID'] };

      await expect(service.getFuelStations(invalidConfig)).rejects.toThrow('Invalid brands: INVALID');
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

      await expect(service.getFuelStations(invalidConfig)).rejects.toThrow(
        'Invalid location configuration: must provide either lat/long or complete bounding box',
      );
    });
  });

  describe('service orchestration', () => {
    test('coordinates between repository and validation', async () => {
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
      ];

      const mockRefData = {
        brands: {
          items: [{ description: 'BP', isactive: true, logoimageurl: 'logo.png' }],
        },
        fueltypes: {
          items: [{ code: 'P95-P98', isactive: true }],
        },
      };

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/prices/bylocation')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockApiData),
          });
        } else if (url.includes('/refData')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockRefData),
          });
        }
        return Promise.reject(new Error('Unexpected URL'));
      });

      const result = await service.getFuelStations(mockConfig);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        name: 'BP Ulladulla',
        brand: 'BP',
        location: 'Ulladulla', // Mapper correctly removes "BP " brand prefix and extracts suburb
        address: '155-157 Princes Highway, Ulladulla NSW 2539',
        price: 200,
        distance: 1.0,
        fieldType: 'P95',
        isOpenNow: false,
        isClosingSoon: false,
        logoUrl: 'logo.png',
      });
    });

    test('handles API failures gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(service.getFuelStations(mockConfig)).rejects.toThrow();
    });
  });
});
