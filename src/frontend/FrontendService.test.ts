import FrontendService from './FrontendService';
import { FuelStation } from '../types/Config';

describe('FrontendService', () => {
  describe('getPriceStyle', () => {
    test('returns correct currency style', () => {
      const style = FrontendService.getPriceStyle();

      expect(style).toEqual({
        style: 'currency',
        currency: 'AUD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    });
  });

  describe('getDistanceStyle', () => {
    test('returns correct decimal style', () => {
      const style = FrontendService.getDistanceStyle();

      expect(style).toEqual({
        style: 'decimal',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      });
    });
  });

  describe('getPrice', () => {
    test('formats price correctly', () => {
      const station: FuelStation = {
        name: 'Test Station',
        brand: 'BP',
        location: 'Test Location',
        address: '123 Test St',
        price: 195.5,
        distance: 1.2,
        fieldType: 'P95',
        isOpenNow: true,
        isClosingSoon: false,
        logoUrl: 'logo.png',
      };

      const result = FrontendService.getPrice(station);

      expect(result).toBe('$195.50');
    });

    test('formats price with cents correctly', () => {
      const station: FuelStation = {
        name: 'Test Station',
        brand: 'BP',
        location: 'Test Location',
        address: '123 Test St',
        price: 200,
        distance: 1.2,
        fieldType: 'P95',
        isOpenNow: true,
        isClosingSoon: false,
        logoUrl: 'logo.png',
      };

      const result = FrontendService.getPrice(station);

      expect(result).toBe('$200.00');
    });
  });

  describe('getDistance', () => {
    test('formats distance correctly', () => {
      const station: FuelStation = {
        name: 'Test Station',
        brand: 'BP',
        location: 'Test Location',
        address: '123 Test St',
        price: 195,
        distance: 1.25,
        fieldType: 'P95',
        isOpenNow: true,
        isClosingSoon: false,
        logoUrl: 'logo.png',
      };

      const result = FrontendService.getDistance(station);

      expect(result).toBe('1.3km');
    });

    test('formats whole number distance correctly', () => {
      const station: FuelStation = {
        name: 'Test Station',
        brand: 'BP',
        location: 'Test Location',
        address: '123 Test St',
        price: 195,
        distance: 2.0,
        fieldType: 'P95',
        isOpenNow: true,
        isClosingSoon: false,
        logoUrl: 'logo.png',
      };

      const result = FrontendService.getDistance(station);

      expect(result).toBe('2.0km');
    });
  });

  describe('getStationName', () => {
    test('returns station name', () => {
      const station: FuelStation = {
        name: 'Test Station',
        brand: 'BP',
        location: 'Test Location',
        address: '123 Test St',
        price: 195,
        distance: 1.2,
        fieldType: 'P95',
        isOpenNow: true,
        isClosingSoon: false,
        logoUrl: 'logo.png',
      };

      const result = FrontendService.getStationName(station);

      expect(result).toBe('Test Station');
    });
  });

  describe('getOpenStatus', () => {
    test("returns 'Open' when station is open", () => {
      const station: FuelStation = {
        name: 'Test Station',
        brand: 'BP',
        location: 'Test Location',
        address: '123 Test St',
        price: 195,
        distance: 1.2,
        fieldType: 'P95',
        isOpenNow: true,
        isClosingSoon: false,
        logoUrl: 'logo.png',
      };

      const result = FrontendService.getOpenStatus(station);

      expect(result).toBe('Open');
    });

    test("returns 'Closed' when station is closed", () => {
      const station: FuelStation = {
        name: 'Test Station',
        brand: 'BP',
        location: 'Test Location',
        address: '123 Test St',
        price: 195,
        distance: 1.2,
        fieldType: 'P95',
        isOpenNow: false,
        isClosingSoon: false,
        logoUrl: 'logo.png',
      };

      const result = FrontendService.getOpenStatus(station);

      expect(result).toBe('Closed');
    });

    test("returns 'Closing Soon' when station is closing soon", () => {
      const station: FuelStation = {
        name: 'Test Station',
        brand: 'BP',
        location: 'Test Location',
        address: '123 Test St',
        price: 195,
        distance: 1.2,
        fieldType: 'P95',
        isOpenNow: true,
        isClosingSoon: true,
        logoUrl: 'logo.png',
      };

      const result = FrontendService.getOpenStatus(station);

      expect(result).toBe('Closing Soon');
    });
  });

  describe('getFuelType', () => {
    test('returns fuel type', () => {
      const station: FuelStation = {
        name: 'Test Station',
        brand: 'BP',
        location: 'Test Location',
        address: '123 Test St',
        price: 195,
        distance: 1.2,
        fieldType: 'P95',
        isOpenNow: true,
        isClosingSoon: false,
        logoUrl: 'logo.png',
      };

      const result = FrontendService.getFuelType(station);

      expect(result).toBe('P95');
    });
  });
});
