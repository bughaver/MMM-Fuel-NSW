import { BackendService } from '../../src/backend/BackendService';
import { Config } from '../../src/types/Config';

describe('MMM-Fuel-NSW E2E Tests', () => {
  let service: BackendService;

  beforeAll(() => {
    service = new BackendService();
  });

  describe('Real Fuel API Integration', () => {
    test('fetches real fuel stations with default config', async () => {
      const config: Config = {
        fuelType: 'P95-P98',
        brands: [],
        radius: 2,
        sortBy: 'price',
        lat: -33.93993412910857, // Sydney CBD coordinates
        long: 151.1270892114922,
        limit: 3,
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
        alignment: 'left',
      };

      const result = await service.getFuelStations(config);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result.length).toBeLessThanOrEqual(3);

      // Check structure of first station
      const station = result[0];
      expect(station).toHaveProperty('name');
      expect(station).toHaveProperty('brand');
      expect(station).toHaveProperty('location');
      expect(station).toHaveProperty('address');
      expect(station).toHaveProperty('price');
      expect(station).toHaveProperty('distance');
      expect(station).toHaveProperty('fieldType');
      expect(station).toHaveProperty('isOpenNow');
      expect(station).toHaveProperty('isClosingSoon');

      // Check data types
      expect(typeof station.name).toBe('string');
      expect(typeof station.brand).toBe('string');
      expect(typeof station.location).toBe('string');
      expect(typeof station.address).toBe('string');
      expect(typeof station.price).toBe('number');
      expect(typeof station.distance).toBe('number');
      expect(typeof station.fieldType).toBe('string');
      expect(typeof station.isOpenNow).toBe('boolean');
      expect(typeof station.isClosingSoon).toBe('boolean');
    }, 15000);

    test('fetches real fuel stations with brand filter', async () => {
      const config: Config = {
        fuelType: 'P95-P98',
        brands: ['BP'],
        radius: 3,
        sortBy: 'price',
        lat: -33.93993412910857,
        long: 151.1270892114922,
        limit: 5,
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
        alignment: 'left',
      };

      const result = await service.getFuelStations(config);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result.length).toBeLessThanOrEqual(5);

      // All stations should be BP
      result.forEach((station) => {
        expect(station.brand).toBe('BP');
      });
    }, 15000);

    test('fetches real fuel stations with distance sorting', async () => {
      const config: Config = {
        fuelType: 'P95-P98',
        brands: [],
        radius: 3,
        sortBy: 'distance',
        lat: -33.93993412910857,
        long: 151.1270892114922,
        limit: 5,
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
        alignment: 'left',
      };

      const result = await service.getFuelStations(config);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result.length).toBeLessThanOrEqual(5);

      // Check that results are sorted by distance (ascending)
      for (let i = 1; i < result.length; i++) {
        expect(result[i].distance).toBeGreaterThanOrEqual(result[i - 1].distance);
      }
    }, 15000);

    test('fetches real fuel stations with price sorting', async () => {
      const config: Config = {
        fuelType: 'P95-P98',
        brands: [],
        radius: 3,
        sortBy: 'price',
        lat: -33.93993412910857,
        long: 151.1270892114922,
        limit: 5,
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
        alignment: 'left',
      };

      const result = await service.getFuelStations(config);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result.length).toBeLessThanOrEqual(5);

      // Check that results are sorted by price (ascending)
      for (let i = 1; i < result.length; i++) {
        expect(result[i].price).toBeGreaterThanOrEqual(result[i - 1].price);
      }
    }, 15000);

    test('fetches real fuel stations with bounding box', async () => {
      const config: Config = {
        fuelType: 'P95-P98',
        brands: [],
        bottomLeftLatitude: -34,
        bottomLeftLongitude: 150,
        topRightLatitude: -33,
        topRightLongitude: 152,
        radius: 5, // Add required radius
        sortBy: 'price' as const, // Add required sortBy
        limit: 5,
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
        alignment: 'left',
      };

      const result = await service.getFuelStations(config);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result.length).toBeLessThanOrEqual(5);
    }, 15000);

    test('fetches real fuel stations with different fuel type', async () => {
      const config: Config = {
        fuelType: 'U91',
        brands: [],
        radius: 2,
        sortBy: 'price',
        lat: -33.93993412910857,
        long: 151.1270892114922,
        limit: 3,
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
        alignment: 'left',
      };

      const result = await service.getFuelStations(config);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result.length).toBeLessThanOrEqual(3);

      // All stations should have U91 fuel type
      result.forEach((station) => {
        expect(station.fieldType).toBe('U91');
      });
    }, 15000);

    test('handles API errors gracefully', async () => {
      const invalidConfig: Config = {
        fuelType: 'INVALID_FUEL_TYPE',
        brands: [],
        radius: 2,
        sortBy: 'price',
        lat: -33.93993412910857,
        long: 151.1270892114922,
        limit: 3,
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
        alignment: 'left',
      };

      await expect(service.getFuelStations(invalidConfig)).rejects.toThrow();
    }, 15000);
  });
});
