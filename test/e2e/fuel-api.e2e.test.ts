import { BackendService } from '../../src/backend/Service/BackendService';
import { BackendRepository } from '../../src/backend/Service/Repository/BackendRepository';
import { BackendMapper } from '../../src/backend/Service/Repository/Mapper/BackendMapper';
import { FuelApiConnector } from '../../src/backend/Service/Repository/Connector/FuelApiConnector';
import { Config } from '../../src/Types';

describe('MMM-Fuel-NSW E2E Tests', () => {
  let service: BackendService;

  beforeAll(async () => {
    const fuelApiConnector = new FuelApiConnector();
    const backendMapper = new BackendMapper();
    const backendRepository = new BackendRepository(backendMapper, fuelApiConnector);
    service = new BackendService(backendRepository);
  });

  describe('Real Fuel API Integration', () => {
    test('fetches real fuel stations with default config', async () => {
      const config: Config = {
        fuelType: 'P95-P98',
        brands: [],
        radius: 2,
        sortBy: 'price',
        lat: -33.93993412910857,
        long: 151.1270892114922,
        limit: 3,
        distance: 10,
        updateIntervalInSeconds: 600,
        showDistance: true,
        showAddress: false,
        showLogo: true,
        showOpenStatus: true,
        showFuelType: false,
        showClosedStations: true,
        borderStyle: 'individual',
        showLastUpdate: false,
        displayMode: 'list',
        alignment: 'left',
        priceUnit: 'cents',
      };

      const result = await service.getFuelStations(config);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result.length).toBeLessThanOrEqual(3);

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

      expect(typeof station.name).toBe('string');
      expect(typeof station.brand).toBe('string');
      expect(typeof station.location).toBe('string');
      expect(typeof station.address).toBe('string');
      expect(typeof station.price).toBe('string');
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
        distance: 10,
        updateIntervalInSeconds: 600,
        showDistance: true,
        showAddress: false,
        showLogo: true,
        showOpenStatus: true,
        showFuelType: false,
        showClosedStations: true,
        borderStyle: 'individual',
        showLastUpdate: false,
        displayMode: 'list',
        alignment: 'left',
        priceUnit: 'cents',
      };

      const result = await service.getFuelStations(config);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result.length).toBeLessThanOrEqual(5);

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
        distance: 10,
        updateIntervalInSeconds: 600,
        showDistance: true,
        showAddress: false,
        showLogo: true,
        showOpenStatus: true,
        showFuelType: false,
        showClosedStations: true,
        borderStyle: 'individual',
        showLastUpdate: false,
        displayMode: 'list',
        alignment: 'left',
        priceUnit: 'cents',
      };

      const result = await service.getFuelStations(config);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result.length).toBeLessThanOrEqual(5);

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
        distance: 10,
        updateIntervalInSeconds: 600,
        showDistance: true,
        showAddress: false,
        showLogo: true,
        showOpenStatus: true,
        showFuelType: false,
        showClosedStations: true,
        borderStyle: 'individual',
        showLastUpdate: false,
        displayMode: 'list',
        alignment: 'left',
        priceUnit: 'cents',
      };

      const result = await service.getFuelStations(config);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result.length).toBeLessThanOrEqual(5);

      for (let i = 1; i < result.length; i++) {
        const currentPrice = parseFloat(result[i].price.replace('c', ''));
        const prevPrice = parseFloat(result[i - 1].price.replace('c', ''));
        expect(currentPrice).toBeGreaterThanOrEqual(prevPrice);
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
        radius: 5,
        sortBy: 'price' as const,
        limit: 5,
        distance: 10,
        updateIntervalInSeconds: 600,
        showDistance: true,
        showAddress: false,
        showLogo: true,
        showOpenStatus: true,
        showFuelType: false,
        showClosedStations: true,
        borderStyle: 'individual',
        showLastUpdate: false,
        displayMode: 'list',
        alignment: 'left',
        priceUnit: 'cents',
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
        distance: 10,
        updateIntervalInSeconds: 600,
        showDistance: true,
        showAddress: false,
        showLogo: true,
        showOpenStatus: true,
        showFuelType: false,
        showClosedStations: true,
        borderStyle: 'individual',
        showLastUpdate: false,
        displayMode: 'list',
        alignment: 'left',
        priceUnit: 'cents',
      };

      const result = await service.getFuelStations(config);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result.length).toBeLessThanOrEqual(3);

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
        distance: 10,
        updateIntervalInSeconds: 600,
        showDistance: true,
        showAddress: false,
        showLogo: true,
        showOpenStatus: true,
        showFuelType: false,
        showClosedStations: true,
        borderStyle: 'individual',
        showLastUpdate: false,
        displayMode: 'list',
        alignment: 'left',
        priceUnit: 'cents',
      };

      await expect(service.getFuelStations(invalidConfig)).rejects.toThrow();
    }, 15000);
  });
});
