import { BackendMapper } from './BackendMapper';
import { RawFuelStation, ReferenceData } from '../../../BackendTypes';

describe('BackendMapper', () => {
  let mapper: BackendMapper;
  let mockRefData: ReferenceData;

  beforeEach(() => {
    mockRefData = {
      brands: {
        items: [
          { description: 'BP', isactive: true, logoimageurl: 'bp.png' },
          { description: 'Shell', isactive: true, logoimageurl: 'shell.png' },
          { description: 'Metro Fuel', isactive: true, logoimageurl: 'metro.png' },
          { description: 'Budget', isactive: true, logoimageurl: 'budget.png' },
          { description: 'Independent', isactive: true, logoimageurl: 'independent.png' },
        ],
      },
      fueltypes: {
        items: [{ code: 'P95', isactive: true }],
      },
    };

    mapper = new BackendMapper();
  });

  describe('mapToFuelStation', () => {
    const rawStation = {
      Name: 'BP Test Station',
      Brand: 'BP',
      Address: '123 Test St, Sydney NSW 2000',
      Price: 200,
      Distance: 1.5,
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
    };

    test('maps raw station data to domain object', async () => {
      const result = await mapper.mapToFuelStation(rawStation, mockRefData.brands.items, undefined, undefined);

      expect(result).toEqual({
        name: 'BP Test Station',
        brand: 'BP',
        location: 'Sydney', // Now correctly extracts suburb from address
        address: '123 Test Street, Sydney NSW 2000',
        price: 200,
        distance: 1.5,
        fieldType: 'P95',
        isOpenNow: true,
        isClosingSoon: false, // EndTime has passed (test runs after 10 PM)
        logoUrl: 'bp.png',
        tankPrice: undefined,
      });
    });

    test('handles stations without trading hours', async () => {
      const stationWithoutHours = { ...rawStation, tradinghours: undefined };

      const result = await mapper.mapToFuelStation(stationWithoutHours, mockRefData.brands.items, undefined, undefined);

      expect(result.isOpenNow).toBe(false);
      expect(result.isClosingSoon).toBe(false);
    });

    test('handles stations with empty trading hours array', async () => {
      const stationWithEmptyHours = { ...rawStation, tradinghours: [] };

      const result = await mapper.mapToFuelStation(
        stationWithEmptyHours,
        mockRefData.brands.items,
        undefined,
        undefined,
      );

      expect(result.isOpenNow).toBe(false);
      expect(result.isClosingSoon).toBe(false);
    });

    test('returns undefined logoUrl for unknown brands', async () => {
      const stationWithUnknownBrand = { ...rawStation, Brand: 'Unknown Brand' };

      const result = await mapper.mapToFuelStation(
        stationWithUnknownBrand,
        mockRefData.brands.items,
        undefined,
        undefined,
      );

      expect(result.logoUrl).toBeUndefined();
    });

    test('extracts location from address when name matches suburb', async () => {
      const station = {
        Name: 'Metro Bonnyrigg',
        Brand: 'Metro Fuel',
        Address: '709 Cabramatta Road, Bonnyrigg NSW 2177',
        Price: 200,
        Distance: 1.0,
        FuelType: 'P95',
        Day: 'SATURDAY',
        tradinghours: [],
      };

      const result = await mapper.mapToFuelStation(station, mockRefData.brands.items, undefined, undefined);
      expect(result.location).toBe('Bonnyrigg');
    });

    test('adds direction from station name to suburb', async () => {
      const station = {
        Name: 'Metro West Botany North',
        Brand: 'Metro Fuel',
        Address: '365 Garfield Road, West Botany NSW 2019',
        Price: 200,
        Distance: 1.0,
        FuelType: 'P95',
        Day: 'SATURDAY',
        tradinghours: [],
      };

      const result = await mapper.mapToFuelStation(station, mockRefData.brands.items, undefined, undefined);
      expect(result.location).toBe('West Botany North');
    });

    test('Returns location when brand does not match suffix', async () => {
      const station = {
        Name: 'Budget Petrol Chippendale',
        Brand: 'Budget',
        Address: '66-70 Regent Street, Chippendale NSW 2008',
        Price: 200,
        Distance: 1.0,
        FuelType: 'P95',
        Day: 'SATURDAY',
        tradinghours: [],
      };

      const result = await mapper.mapToFuelStation(station, mockRefData.brands.items, undefined, undefined);
      expect(result.location).toBe('Chippendale');
    });

    test('handles exact user example: Budget Petrol Chippendale', async () => {
      const station = {
        Name: 'Budget Petrol Chippendale',
        Brand: 'Budget',
        Address: '66-70 Regent Street, CHIPPENDALE NSW 2008',
        Price: 199.7,
        Distance: 2.2,
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
      };

      const result = await mapper.mapToFuelStation(station, mockRefData.brands.items, undefined, undefined);

      expect(result.location).toBe('Chippendale');
      expect(result.name).toBe('Budget Petrol Chippendale');
      expect(result.brand).toBe('Budget');
    });

    test('handles user example: Trundle Fuel with independent brand', async () => {
      const station = {
        Name: 'Trundle Fuel',
        Brand: 'Independent',
        Address: '77 FORBES ST, TRUNDLE NSW 2875',
        Price: 185.9,
        Distance: 15.7,
        FuelType: 'P95',
        Day: 'SATURDAY',
        tradinghours: [
          {
            Day: 'SATURDAY',
            IsOpenNow: true,
            IsOpen24Hours: false,
            EndTime: '8:00 PM',
          },
        ],
      };

      const result = await mapper.mapToFuelStation(station, mockRefData.brands.items, undefined, undefined);

      expect(result.location).toBe('Trundle');
      expect(result.name).toBe('Trundle Fuel');
      expect(result.brand).toBe('Independent');
    });

    test('falls back to cleaned name when address extraction fails', async () => {
      const station = {
        Name: 'Shell Test Station',
        Brand: 'Shell',
        Address: '123 Test Road', // No NSW postcode
        Price: 200,
        Distance: 1.0,
        FuelType: 'P95',
        Day: 'SATURDAY',
        tradinghours: [],
      };

      const result = await mapper.mapToFuelStation(station, mockRefData.brands.items, undefined, undefined);
      expect(result.location).toBe('Test Station');
    });
  });

  describe('integration tests', () => {
    test('integration: handles time parsing for closing soon', async () => {
      // Create a station that's closing soon
      const mockCurrentTime = new Date();
      mockCurrentTime.setHours(21, 30, 0, 0); // 9:30 PM

      const station = {
        Name: 'Test Station',
        Brand: 'Independent',
        Address: '123 Test Road',
        Price: 200,
        Distance: 1.0,
        FuelType: 'P95',
        Day: 'SATURDAY',
        tradinghours: [
          {
            Day: 'SATURDAY',
            IsOpenNow: true,
            IsOpen24Hours: false,
            EndTime: '10:00 PM', // 30 minutes from mock time
          },
        ],
      };

      const result = await mapper.mapToFuelStation(station, mockRefData.brands.items, mockCurrentTime, undefined);
      expect(result.isClosingSoon).toBe(true);
      expect(result.isOpenNow).toBe(true);
    });

    test('integration: handles undefined brand', async () => {
      const station = {
        Name: 'Test Station',
        Brand: undefined as string | undefined,
        Address: '123 Test Road',
        Price: 200,
        Distance: 1.0,
        FuelType: 'P95',
        Day: 'SATURDAY',
        tradinghours: [],
      } as RawFuelStation;

      const result = await mapper.mapToFuelStation(station, mockRefData.brands.items, undefined, undefined);
      expect(result.brand).toBeUndefined();
      expect(result.logoUrl).toBeUndefined();
    });

    test('integration: handles station closing in more than 1 hour', async () => {
      // Create a station that's closing in more than 1 hour
      const mockCurrentTime = new Date();
      mockCurrentTime.setHours(19, 0, 0, 0); // 7:00 PM

      const station = {
        Name: 'Test Station',
        Brand: 'Independent',
        Address: '123 Test Road',
        Price: 200,
        Distance: 1.0,
        FuelType: 'P95',
        Day: 'SATURDAY',
        tradinghours: [
          {
            Day: 'SATURDAY',
            IsOpenNow: true,
            IsOpen24Hours: false,
            EndTime: '10:00 PM', // 3 hours from mock time
          },
        ],
      };

      const result = await mapper.mapToFuelStation(station, mockRefData.brands.items, mockCurrentTime, undefined);
      expect(result.isClosingSoon).toBe(false);
      expect(result.isOpenNow).toBe(true);
    });

    test('integration: handles station already closed', async () => {
      // Create a station that's already closed
      const mockCurrentTime = new Date();
      mockCurrentTime.setHours(23, 0, 0, 0); // 11:00 PM

      const station = {
        Name: 'Test Station',
        Brand: 'Independent',
        Address: '123 Test Road',
        Price: 200,
        Distance: 1.0,
        FuelType: 'P95',
        Day: 'SATURDAY',
        tradinghours: [
          {
            Day: 'SATURDAY',
            IsOpenNow: false,
            IsOpen24Hours: false,
            EndTime: '10:00 PM', // Already past
          },
        ],
      };

      const result = await mapper.mapToFuelStation(station, mockRefData.brands.items, mockCurrentTime, undefined);
      expect(result.isClosingSoon).toBe(false);
      expect(result.isOpenNow).toBe(false);
    });

    test('integration: handles station with trading hours for different day', async () => {
      // Create a station where Day doesn't match any trading hours
      const station = {
        Name: 'Test Station',
        Brand: 'Independent',
        Address: '123 Test Road',
        Price: 200,
        Distance: 1.0,
        FuelType: 'P95',
        Day: 'SUNDAY', // Different day
        tradinghours: [
          {
            Day: 'SATURDAY',
            IsOpenNow: true,
            IsOpen24Hours: false,
            EndTime: '10:00 PM',
          },
        ],
      };

      const result = await mapper.mapToFuelStation(station, mockRefData.brands.items, undefined, undefined);
      expect(result.isClosingSoon).toBe(false);
      expect(result.isOpenNow).toBe(false);
    });

    test('integration: handles 24-hour station', async () => {
      const station = {
        Name: '24 Hour Station',
        Brand: 'Independent',
        Address: '123 Test Road',
        Price: 200,
        Distance: 1.0,
        FuelType: 'P95',
        Day: 'SATURDAY',
        tradinghours: [
          {
            Day: 'SATURDAY',
            IsOpenNow: true,
            IsOpen24Hours: true,
            EndTime: '12:00 AM',
          },
        ],
      };

      const result = await mapper.mapToFuelStation(station, mockRefData.brands.items, undefined, undefined);
      expect(result.isClosingSoon).toBe(false);
      expect(result.isOpenNow).toBe(true);
    });

    test('integration: handles station with explicit current time', async () => {
      const explicitCurrentTime = new Date();
      explicitCurrentTime.setHours(20, 0, 0, 0); // 8:00 PM

      const station = {
        Name: 'Test Station',
        Brand: 'Independent',
        Address: '123 Test Road',
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
      };

      const result = await mapper.mapToFuelStation(station, mockRefData.brands.items, explicitCurrentTime, undefined);
      expect(result.isClosingSoon).toBe(false);
      expect(result.isOpenNow).toBe(true);
    });
  });
});
