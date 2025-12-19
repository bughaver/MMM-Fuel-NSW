import { LocationUtils } from './LocationUtils';

describe('LocationUtils', () => {
  describe('removeBrandPrefix', () => {
    test('removes brand prefix from station name', () => {
      const result = LocationUtils.removeBrandPrefix('BP Test Station', 'BP');
      expect(result).toBe(' Test Station');
    });

    test('handles exact brand match', () => {
      const result = LocationUtils.removeBrandPrefix('Shell Test Station', 'Shell');
      expect(result).toBe(' Test Station');
    });

    test('handles partial brand match with suffix', () => {
      const result = LocationUtils.removeBrandPrefix('BP Fuel Test Station', 'BP Express');
      expect(result).toBe(' Test Station');
    });

    test('handles roadhouse suffix', () => {
      const result = LocationUtils.removeBrandPrefix('Shell Roadhouse Test Station', 'Shell Express');
      expect(result).toBe(' Test Station');
    });

    test('removes leading dash after brand removal', () => {
      const result = LocationUtils.removeBrandPrefix('BP- Test Station', 'BP');
      expect(result).toBe('Test Station');
    });

    test('removes leading slash after brand removal', () => {
      const result = LocationUtils.removeBrandPrefix('BP/ Test Station', 'BP');
      expect(result).toBe('Test Station');
    });

    test('returns original name when no brand provided', () => {
      const result = LocationUtils.removeBrandPrefix('Test Station', undefined);
      expect(result).toBe('Test Station');
    });

    test('returns original name when brand not found', () => {
      const result = LocationUtils.removeBrandPrefix('Test Station', 'Unknown');
      expect(result).toBe('Test Station');
    });
  });

  describe('combineNameAndAddress', () => {
    test('extracts suburb from address when name matches suburb', () => {
      const result = LocationUtils.combineNameAndAddress('Metro Bonnyrigg', '709 Cabramatta Road, Bonnyrigg NSW 2177');
      expect(result).toBe('Bonnyrigg');
    });

    test('adds direction from station name to suburb', () => {
      const result = LocationUtils.combineNameAndAddress(
        'Metro West Botany North',
        '365 Garfield Road, West Botany NSW 2019',
      );
      expect(result).toBe('West Botany North');
    });

    test('preserves direction when name contains suburb + direction', () => {
      const result = LocationUtils.combineNameAndAddress(
        'OTR Marsden Park North',
        '920 Richmond Road, Marsden Park NSW 2765',
      );
      expect(result).toBe('Marsden Park North');
    });

    test('handles east direction in name', () => {
      const result = LocationUtils.combineNameAndAddress('BP Sydney East', '123 Pitt Street, Sydney NSW 2000');
      expect(result).toBe('Sydney East');
    });

    test('removes parentheses and extra info', () => {
      const result = LocationUtils.combineNameAndAddress(
        'Costco Marsden Park (Members only)',
        '10 Langford Drive, Marsden Park NSW 2765',
      );
      expect(result).toBe('Marsden Park');
    });

    test('falls back to location name when seems like location', () => {
      const result = LocationUtils.combineNameAndAddress('Bondi Beach Service', '123 Main St, Sydney NSW 2000');
      expect(result).toBe('Bondi Beach Service');
    });

    test('falls back to suburb when name does not seem like location', () => {
      const result = LocationUtils.combineNameAndAddress('Generic Service Station', '123 Main St, Sydney NSW 2000');
      expect(result).toBe('Sydney');
    });

    test('handles combineNameAndAddress when normalizedAddress is empty', () => {
      const result = LocationUtils.combineNameAndAddress('Test Station', '');
      expect(result).toBe('Test Station');
    });

    test('handles combineNameAndAddress call when normalizedAddress has special characters', () => {
      const result = LocationUtils.combineNameAndAddress('Test Station', '123 Main St, Test&Suburb NSW 2000');
      expect(result).toBe('Test&Suburb');
    });

    test('handles combineNameAndAddress with empty suburb', () => {
      const result = LocationUtils.combineNameAndAddress('Test Station', '123 Main St');
      expect(result).toBe('Test Station');
    });

    test('handles empty address parts', () => {
      const result = LocationUtils.combineNameAndAddress('Test Station', 'NSW 2000');
      expect(result).toBe('Test Station');
    });
  });

  describe('isRoadType', () => {
    test('returns true for all road types', () => {
      const roadTypes = [
        'road',
        'street',
        'avenue',
        'drive',
        'place',
        'lane',
        'way',
        'highway',
        'close',
        'court',
        'terrace',
        'grove',
        'hill',
        'circuit',
        'boulevard',
      ];

      roadTypes.forEach((roadType) => {
        expect(LocationUtils.isRoadType(roadType)).toBe(true);
        expect(LocationUtils.isRoadType(roadType.toUpperCase())).toBe(true);
        expect(LocationUtils.isRoadType(roadType.charAt(0).toUpperCase() + roadType.slice(1))).toBe(true);
      });
    });

    test('returns false for non-road types', () => {
      const nonRoadTypes = ['park', 'beach', 'suburb', 'city', 'building', 'house', 'apartment'];

      nonRoadTypes.forEach((word) => {
        expect(LocationUtils.isRoadType(word)).toBe(false);
      });
    });
  });

  describe('isDirection', () => {
    test('returns true for all directions', () => {
      const directions = ['north', 'south', 'east', 'west', 'central', 'inner', 'outer', 'upper', 'lower'];

      directions.forEach((direction) => {
        expect(LocationUtils.isDirection(direction)).toBe(true);
        expect(LocationUtils.isDirection(direction.toUpperCase())).toBe(true);
        expect(LocationUtils.isDirection(direction.charAt(0).toUpperCase() + direction.slice(1))).toBe(true);
      });
    });

    test('returns false for non-directions', () => {
      const nonDirections = ['park', 'beach', 'road', 'street', 'building'];

      nonDirections.forEach((word) => {
        expect(LocationUtils.isDirection(word)).toBe(false);
      });
    });
  });

  describe('seemsLikeLocationName', () => {
    test('returns true for names containing location keywords', () => {
      const locationNames = [
        'Bondi Beach Service Station',
        'Central Park Fuel',
        'Mountain View Petrol',
        'Beach Road Station',
        'City Centre Petrol',
      ];

      locationNames.forEach((name) => {
        expect(LocationUtils.seemsLikeLocationName(name)).toBe(true);
      });
    });

    test('returns false for names without location keywords', () => {
      const nonLocationNames = ['Generic Service Station', 'Standard Fuel Stop'];

      nonLocationNames.forEach((name) => {
        expect(LocationUtils.seemsLikeLocationName(name)).toBe(false);
      });
    });
  });

  describe('extractSuburbCandidate', () => {
    test('returns suburb candidate when last word is not a road type', () => {
      const result = LocationUtils.extractSuburbCandidate(['123', 'Main', 'Street', 'Sydney']);
      expect(result).toBe('Sydney');
    });

    test('includes direction when second last word is direction', () => {
      const result = LocationUtils.extractSuburbCandidate(['123', 'Main', 'North', 'Sydney']);
      expect(result).toBe('North Sydney');
    });

    test('falls back to last word when it is a road type', () => {
      const result = LocationUtils.extractSuburbCandidate(['123', 'Main', 'Road']);
      expect(result).toBe('Road');
    });

    test('returns empty string for empty parts', () => {
      const result = LocationUtils.extractSuburbCandidate([]);
      expect(result).toBe('');
    });

    test('skips words with numbers', () => {
      const result = LocationUtils.extractSuburbCandidate(['123', 'Main', '1st', 'Street']);
      expect(result).toBe('Street');
    });

    test('falls back to last word when it contains digits', () => {
      const result = LocationUtils.extractSuburbCandidate(['123', 'Main', '123']);
      expect(result).toBe('123');
    });

    test('returns single word when parts has only one element', () => {
      const result = LocationUtils.extractSuburbCandidate(['Sydney']);
      expect(result).toBe('Sydney');
    });
  });

  describe('toPascalCase', () => {
    test('converts lowercase to Pascal case', () => {
      const result = LocationUtils.toPascalCase('test station name');
      expect(result).toBe('Test Station Name');
    });

    test('handles single word', () => {
      const result = LocationUtils.toPascalCase('station');
      expect(result).toBe('Station');
    });

    test('handles empty string', () => {
      const result = LocationUtils.toPascalCase('');
      expect(result).toBe('');
    });

    test('trims whitespace', () => {
      const result = LocationUtils.toPascalCase('  test station  ');
      expect(result).toBe('Test Station');
    });
  });
});
