import { FuelApiConnector } from './FuelApiConnector';
import { ReferenceData, RawFuelStation, BoundingBox } from '../../../BackendTypes';

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('FuelApiConnector', () => {
  let connector: FuelApiConnector;

  beforeEach(() => {
    jest.clearAllMocks();
    connector = new FuelApiConnector();
  });

  describe('fetchReferenceData', () => {
    const mockRefData: ReferenceData = {
      brands: {
        items: [{ description: 'BP', isactive: true, logoimageurl: 'bp.png' }],
      },
      fueltypes: {
        items: [{ code: 'P95', isactive: true }],
      },
    };

    test('fetches and returns reference data successfully', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockRefData),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await connector.fetchReferenceData();

      expect(mockFetch).toHaveBeenCalledWith('https://www.fuelcheck.nsw.gov.au/fuel/api/v1/fuel/refData');
      expect(result).toEqual(mockRefData);
    });

    test('throws error when response is not ok', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
      };
      mockFetch.mockResolvedValue(mockResponse);

      await expect(connector.fetchReferenceData()).rejects.toThrow('Failed to fetch reference data: 500');
    });
  });

  describe('fetchFuelStationsByLocation', () => {
    const mockStations: RawFuelStation[] = [
      {
        Name: 'Test Station',
        Brand: 'BP',
        Address: '123 Test St',
        Price: 200,
        Distance: 1.0,
        FuelType: 'P95',
        Day: 'SATURDAY',
        tradinghours: [],
      },
    ];

    const boundingBox: BoundingBox = {
      bottomLeftLatitude: -34.0,
      bottomLeftLongitude: 150.0,
      topRightLatitude: -33.0,
      topRightLongitude: 151.0,
    };

    test('fetches fuel stations with correct parameters', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockStations),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await connector.fetchFuelStationsByLocation('P95', ['BP'], boundingBox);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://www.fuelcheck.nsw.gov.au/fuel/api/v1/fuel/prices/bylocation?' +
          'fuelType=P95&brands=BP&bottomLeftLatitude=-34&bottomLeftLongitude=150&' +
          'topRightLatitude=-33&topRightLongitude=151',
      );
      expect(result).toEqual(mockStations);
    });

    test('handles empty brands array', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockStations),
      };
      mockFetch.mockResolvedValue(mockResponse);

      await connector.fetchFuelStationsByLocation('P95', [], boundingBox);

      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('brands='));
    });

    test('joins multiple brands with pipe separator', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockStations),
      };
      mockFetch.mockResolvedValue(mockResponse);

      await connector.fetchFuelStationsByLocation('P95', ['BP', 'Shell'], boundingBox);

      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('brands=BP%7CShell'));
    });

    test('throws error when fuel stations response is not ok', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
      };
      mockFetch.mockResolvedValue(mockResponse);

      await expect(connector.fetchFuelStationsByLocation('P95', ['BP'], boundingBox)).rejects.toThrow(
        'Failed to fetch fuel stations: 404',
      );
    });
  });
});
