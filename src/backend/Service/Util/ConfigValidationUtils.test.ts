import { ConfigValidationUtils } from './ConfigValidationUtils';
import { Config } from '../../../Types';
import { ReferenceData } from '../../BackendTypes';

describe('ConfigValidationUtils', () => {
  const mockReferenceData: ReferenceData = {
    brands: {
      items: [
        { description: 'BP', isactive: true, logoimageurl: 'logo.png' },
        { description: 'Shell', isactive: true, logoimageurl: 'logo2.png' },
        { description: 'Caltex', isactive: false, logoimageurl: 'logo3.png' },
      ],
    },
    fueltypes: {
      items: [
        { code: 'P95', isactive: true },
        { code: 'P98', isactive: true },
        { code: 'Diesel', isactive: false },
      ],
    },
  };

  describe('validateConfigWithReferenceData', () => {
    test('validates valid config successfully', async () => {
      const config: Config = {
        fuelType: 'P95',
        brands: ['BP'],
        radius: 3,
        sortBy: 'price',
        limit: 5,
        distance: 10,
        lat: -33.8688,
        long: 151.2093,
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

      const result = await ConfigValidationUtils.validateConfigWithReferenceData(config, mockReferenceData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('returns error for invalid fuel type', async () => {
      const config: Config = {
        fuelType: 'INVALID',
        brands: [],
        radius: 3,
        sortBy: 'price',
        limit: 5,
        distance: 10,
        lat: -33.8688,
        long: 151.2093,
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

      const result = await ConfigValidationUtils.validateConfigWithReferenceData(config, mockReferenceData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid fuel type: INVALID');
    });

    test('returns error for invalid brand', async () => {
      const config: Config = {
        fuelType: 'P95',
        brands: ['INVALID'],
        radius: 3,
        sortBy: 'price',
        limit: 5,
        distance: 10,
        lat: -33.8688,
        long: 151.2093,
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

      const result = await ConfigValidationUtils.validateConfigWithReferenceData(config, mockReferenceData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid brands: INVALID');
    });

    test('returns error for inactive fuel type', async () => {
      const config: Config = {
        fuelType: 'Diesel',
        brands: [],
        radius: 3,
        sortBy: 'price',
        limit: 5,
        distance: 10,
        lat: -33.8688,
        long: 151.2093,
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

      const result = await ConfigValidationUtils.validateConfigWithReferenceData(config, mockReferenceData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid fuel type: Diesel');
    });

    test('returns error for inactive brand', async () => {
      const config: Config = {
        fuelType: 'P95',
        brands: ['Caltex'],
        radius: 3,
        sortBy: 'price',
        limit: 5,
        distance: 10,
        lat: -33.8688,
        long: 151.2093,
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

      const result = await ConfigValidationUtils.validateConfigWithReferenceData(config, mockReferenceData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid brands: Caltex');
    });

    test('returns error when no location configuration provided', async () => {
      const config: Config = {
        fuelType: 'P95',
        brands: [],
        radius: 3,
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

      const result = await ConfigValidationUtils.validateConfigWithReferenceData(config, mockReferenceData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Must provide either lat/long or complete bounding box coordinates');
    });

    test('returns error when both lat/long and bounding box provided', async () => {
      const config: Config = {
        fuelType: 'P95',
        brands: [],
        radius: 3,
        sortBy: 'price',
        limit: 5,
        distance: 10,
        lat: -33.8688,
        long: 151.2093,
        bottomLeftLatitude: -34,
        bottomLeftLongitude: 150,
        topRightLatitude: -33,
        topRightLongitude: 152,
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

      const result = await ConfigValidationUtils.validateConfigWithReferenceData(config, mockReferenceData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Cannot provide both lat/long and bounding box coordinates');
    });
  });
});
