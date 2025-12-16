import { BoundingBoxUtils } from './BoundingBoxUtils';
import { Config } from '../../../../types/Config';

describe('BoundingBoxUtils', () => {
  describe('calculateBoundingBox', () => {
    test('calculates bounding box from lat/long and radius', () => {
      const config: Config = {
        lat: -33.93993412910857,
        long: 151.1270892114922,
        radius: 3,
        fuelType: 'P95',
        brands: [],
        sortBy: 'price',
        limit: 5,
        distance: 10,
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
        alignment: 'center',
      };

      const result = BoundingBoxUtils.calculateBoundingBox(config);

      expect(result).toEqual({
        bottomLeftLatitude: -33.966961156135596,
        bottomLeftLongitude: 151.09451174464132,
        topRightLatitude: -33.91290710208155,
        topRightLongitude: 151.1596666783431,
      });
    });

    test('uses provided bounding box when complete', () => {
      const config: Config = {
        bottomLeftLatitude: -34,
        bottomLeftLongitude: 150,
        topRightLatitude: -33,
        topRightLongitude: 152,
        fuelType: 'P95',
        brands: [],
        sortBy: 'price',
        radius: 3,
        limit: 5,
        distance: 10,
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
        alignment: 'center',
      };

      const result = BoundingBoxUtils.calculateBoundingBox(config);

      expect(result).toEqual({
        bottomLeftLatitude: -34,
        bottomLeftLongitude: 150,
        topRightLatitude: -33,
        topRightLongitude: 152,
      });
    });

    test('throws error when neither lat/long nor complete bounding box provided', () => {
      const config: Config = {
        fuelType: 'P95',
        brands: [],
        sortBy: 'price',
        radius: 3,
        limit: 5,
        distance: 10,
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
        alignment: 'center',
      };

      expect(() => BoundingBoxUtils.calculateBoundingBox(config)).toThrow(
        'Invalid location configuration: must provide either lat/long or complete bounding box',
      );
    });
  });

  describe('createBoundingBoxFromCenter', () => {
    test('creates correct bounding box', () => {
      const result = BoundingBoxUtils.createBoundingBoxFromCenter(-33.93993412910857, 151.1270892114922, 3);

      expect(result).toEqual({
        bottomLeftLatitude: -33.966961156135596,
        bottomLeftLongitude: 151.09451174464132,
        topRightLatitude: -33.91290710208155,
        topRightLongitude: 151.1596666783431,
      });
    });
  });

  describe('hasCompleteBoundingBox', () => {
    test('returns true when all bounding box coordinates are provided', () => {
      const config: Config = {
        bottomLeftLatitude: -34,
        bottomLeftLongitude: 150,
        topRightLatitude: -33,
        topRightLongitude: 152,
        fuelType: 'P95',
        brands: [],
        sortBy: 'price',
        radius: 3,
        limit: 5,
        distance: 10,
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
        alignment: 'center',
      };

      expect(BoundingBoxUtils.hasCompleteBoundingBox(config)).toBe(true);
    });

    test('returns false when any bounding box coordinate is missing', () => {
      const config: Config = {
        bottomLeftLatitude: -34,
        bottomLeftLongitude: 150,
        topRightLatitude: -33,
        // topRightLongitude missing
        fuelType: 'P95',
        brands: [],
        sortBy: 'price',
        radius: 3,
        limit: 5,
        distance: 10,
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
        alignment: 'center',
      };

      expect(BoundingBoxUtils.hasCompleteBoundingBox(config)).toBe(false);
    });
  });
});
