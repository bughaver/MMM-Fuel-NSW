import { AddressUtils } from './AddressUtils';

describe('AddressUtils', () => {
  describe('normalizeAddress', () => {
    test('capitalizes state abbreviations', () => {
      const result = AddressUtils.normalizeAddress('123 test st, sydney nsw 2000');
      expect(result).toContain('NSW');
      expect(result).toBe('123 Test Street, Sydney NSW 2000');
    });

    test('expands road abbreviations', () => {
      const result = AddressUtils.normalizeAddress('123 test rd, sydney NSW 2000');
      expect(result).toContain('Road');
      expect(result).toBe('123 Test Road, Sydney NSW 2000');
    });

    test('expands street abbreviations', () => {
      const result = AddressUtils.normalizeAddress('123 test st, sydney NSW 2000');
      expect(result).toContain('Street');
      expect(result).toBe('123 Test Street, Sydney NSW 2000');
    });

    test('handles direction abbreviations correctly', () => {
      // Direction abbreviations should be capitalized at start of address
      expect(AddressUtils.normalizeAddress('n test st, sydney NSW 2000')).toBe('N Test Street, Sydney NSW 2000');
      expect(AddressUtils.normalizeAddress('nw test st, sydney NSW 2000')).toBe('Nw Test Street, Sydney NSW 2000');
      expect(AddressUtils.normalizeAddress('ne test st, sydney NSW 2000')).toBe('Ne Test Street, Sydney NSW 2000');
      expect(AddressUtils.normalizeAddress('sw test st, sydney NSW 2000')).toBe('Sw Test Street, Sydney NSW 2000');
      expect(AddressUtils.normalizeAddress('se test st, sydney NSW 2000')).toBe('Se Test Street, Sydney NSW 2000');
      expect(AddressUtils.normalizeAddress('e test st, sydney NSW 2000')).toBe('E Test Street, Sydney NSW 2000');
      expect(AddressUtils.normalizeAddress('w test st, sydney NSW 2000')).toBe('W Test Street, Sydney NSW 2000');
      expect(AddressUtils.normalizeAddress('s test st, sydney NSW 2000')).toBe('S Test Street, Sydney NSW 2000');

      // Direction abbreviations should stay lowercase in middle of address
      expect(AddressUtils.normalizeAddress('123 n main st, sydney NSW 2000')).toBe(
        '123 N Main Street, Sydney NSW 2000',
      );
      expect(AddressUtils.normalizeAddress('123 nw main st, sydney NSW 2000')).toBe(
        '123 Nw Main Street, Sydney NSW 2000',
      );
    });

    test('applies proper title case to regular words', () => {
      expect(AddressUtils.normalizeAddress('123 main street, SYDNEY NSW 2000')).toBe(
        '123 Main Street, Sydney NSW 2000',
      );
      expect(AddressUtils.normalizeAddress('UPPERCASE ST, LOWERCASE NSW 2000')).toBe(
        'Uppercase Street, Lowercase NSW 2000',
      );
    });

    test('formats corner abbreviations', () => {
      const result = AddressUtils.normalizeAddress('123 test st cnr main rd, sydney NSW 2000');
      expect(result).toContain('Corner');
      expect(result).toBe('123 Test Street Corner Main Road, Sydney NSW 2000');
    });

    test('standardizes comma spacing', () => {
      expect(AddressUtils.normalizeAddress('123 test st,  sydney NSW 2000')).toBe('123 Test Street, Sydney NSW 2000');
      expect(AddressUtils.normalizeAddress('123 test st,,sydney NSW 2000')).toBe('123 Test Street, Sydney NSW 2000');
      expect(AddressUtils.normalizeAddress('123 test st,   sydney NSW 2000')).toBe('123 Test Street, Sydney NSW 2000');
    });

    test('handles multiple consecutive commas', () => {
      expect(AddressUtils.normalizeAddress('123 test st,,,sydney NSW 2000')).toBe('123 Test Street, Sydney NSW 2000');
      expect(AddressUtils.normalizeAddress('123 test st,, ,sydney NSW 2000')).toBe('123 Test Street, Sydney NSW 2000');
    });

    test('cleans up multiple spaces', () => {
      expect(AddressUtils.normalizeAddress('123  test    st,   sydney   NSW    2000')).toBe(
        '123 Test Street, Sydney NSW 2000',
      );
    });

    test('handles empty address', () => {
      const result = AddressUtils.normalizeAddress('');
      expect(result).toBe('');
    });

    test('handles undefined address', () => {
      const result = AddressUtils.normalizeAddress(undefined);
      expect(result).toBe('');
    });

    test('preserves short words that are not directions', () => {
      expect(AddressUtils.normalizeAddress('123 a st, sydney NSW 2000')).toBe('123 A Street, Sydney NSW 2000');
      expect(AddressUtils.normalizeAddress('123 an st, sydney NSW 2000')).toBe('123 An Street, Sydney NSW 2000');
      expect(AddressUtils.normalizeAddress('123 the st, sydney NSW 2000')).toBe('123 The Street, Sydney NSW 2000');
    });

    test('handles ampersand in address', () => {
      const result = AddressUtils.normalizeAddress('123 main st & high st, sydney NSW 2000');
      expect(result).toBe('123 Main Street & High Street, Sydney NSW 2000');
    });
  });

  describe('extractSuburbFromAddress', () => {
    test('extracts suburb from comma-separated address', () => {
      const result = AddressUtils.extractSuburbFromAddress('123 Test Street, Sydney NSW 2000');
      expect(result).toBe('Sydney');
    });

    test('extracts suburb from space-separated address', () => {
      const result = AddressUtils.extractSuburbFromAddress('123 Test Street Sydney NSW 2000');
      expect(result).toBe('Sydney');
    });

    test('handles suburb with direction', () => {
      const result = AddressUtils.extractSuburbFromAddress('123 Test Street, North Sydney NSW 2000');
      expect(result).toBe('North Sydney');
    });

    test('returns empty string for addresses without NSW postcode', () => {
      const result = AddressUtils.extractSuburbFromAddress('123 Test Street, Sydney');
      expect(result).toBe('');
    });

    test('handles undefined or empty address', () => {
      expect(AddressUtils.extractSuburbFromAddress('')).toBe('');
      expect(AddressUtils.extractSuburbFromAddress(undefined)).toBe('');
    });

    test('handles space-separated address format', () => {
      const result = AddressUtils.extractSuburbFromAddress('123 Test Road Sydney NSW 2000');
      expect(result).toBe('Sydney');
    });

    test('handles suburb with direction in space-separated format', () => {
      const result = AddressUtils.extractSuburbFromAddress('123 Test Road North Sydney NSW 2000');
      expect(result).toBe('North Sydney');
    });

    test('returns empty string when no NSW postcode found', () => {
      const result = AddressUtils.extractSuburbFromAddress('123 Test Road Sydney');
      expect(result).toBe('');
    });

    test('handles road type as last word fallback', () => {
      const result = AddressUtils.extractSuburbFromAddress('123 Main Road NSW 2000');
      expect(result).toBe('Road');
    });

    test('handles number in suburb candidate', () => {
      const result = AddressUtils.extractSuburbFromAddress('123 Test Street 1st Avenue NSW 2000');
      expect(result).toBe('Avenue');
    });

    test('expands hw abbreviation to Highway', () => {
      const result = AddressUtils.normalizeAddress('123 main hw, test suburb NSW 2000');
      expect(result).toContain('Highway');
      expect(result).toBe('123 Main Highway, Test Suburb NSW 2000');
    });

    test('handles mixed case input', () => {
      const result = AddressUtils.normalizeAddress('123 MAIN st, SYDNEY nsw 2000');
      expect(result).toBe('123 Main Street, Sydney NSW 2000');
    });

    test('capitalizes regular words that are not state abbreviations', () => {
      const result = AddressUtils.normalizeAddress('123 main street, test suburb nsw 2000');
      expect(result).toBe('123 Main Street, Test Suburb NSW 2000');
    });

    test('expands road abbreviations and capitalizes correctly', () => {
      const result = AddressUtils.normalizeAddress('123 main rd, test suburb nsw 2000');
      expect(result).toBe('123 Main Road, Test Suburb NSW 2000');
    });

    test('handles single word addresses', () => {
      const result = AddressUtils.normalizeAddress('sydney');
      expect(result).toBe('Sydney');
    });

    test('handles addresses with only numbers', () => {
      const result = AddressUtils.normalizeAddress('123');
      expect(result).toBe('123');
    });

    test('expands remaining road abbreviations not covered', () => {
      // Test abbreviations that might not be covered in other tests
      expect(AddressUtils.normalizeAddress('123 main circuit, suburb NSW 2000')).toBe(
        '123 Main Circuit, Suburb NSW 2000',
      );
      expect(AddressUtils.normalizeAddress('123 main terrace, suburb NSW 2000')).toBe(
        '123 Main Terrace, Suburb NSW 2000',
      );
      expect(AddressUtils.normalizeAddress('123 main grove, suburb NSW 2000')).toBe('123 Main Grove, Suburb NSW 2000');
    });

    test('handles words that are not state abbreviations', () => {
      // Ensure the false branch of state abbreviation check is covered
      const result = AddressUtils.normalizeAddress('123 main street, test suburb NSW 2000');
      expect(result).toBe('123 Main Street, Test Suburb NSW 2000');
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
        expect(AddressUtils.isRoadType(roadType)).toBe(true);
        expect(AddressUtils.isRoadType(roadType.toUpperCase())).toBe(true);
        expect(AddressUtils.isRoadType(roadType.charAt(0).toUpperCase() + roadType.slice(1))).toBe(true);
      });
    });

    test('returns false for non-road types', () => {
      const nonRoadTypes = ['park', 'beach', 'suburb', 'city', 'building', 'house', 'apartment'];

      nonRoadTypes.forEach((word) => {
        expect(AddressUtils.isRoadType(word)).toBe(false);
      });
    });
  });

  describe('isDirection', () => {
    test('returns true for all directions', () => {
      const directions = ['north', 'south', 'east', 'west', 'central', 'inner', 'outer', 'upper', 'lower'];

      directions.forEach((direction) => {
        expect(AddressUtils.isDirection(direction)).toBe(true);
        expect(AddressUtils.isDirection(direction.toUpperCase())).toBe(true);
        expect(AddressUtils.isDirection(direction.charAt(0).toUpperCase() + direction.slice(1))).toBe(true);
      });
    });

    test('returns false for non-directions', () => {
      const nonDirections = ['park', 'beach', 'road', 'street', 'building'];

      nonDirections.forEach((word) => {
        expect(AddressUtils.isDirection(word)).toBe(false);
      });
    });
  });

  describe('extractSuburbCandidate', () => {
    test('returns suburb candidate when last word is not a road type', () => {
      const result = AddressUtils.extractSuburbCandidate(['123', 'Main', 'Street', 'Sydney']);
      expect(result).toBe('Sydney');
    });

    test('includes direction when second last word is direction', () => {
      const result = AddressUtils.extractSuburbCandidate(['123', 'Main', 'North', 'Sydney']);
      expect(result).toBe('North Sydney');
    });

    test('includes direction when second last word is direction', () => {
      const result = AddressUtils.extractSuburbCandidate(['Main']);
      expect(result).toBe('Main');
    });

    test('falls back to last word when it is a road type', () => {
      const result = AddressUtils.extractSuburbCandidate(['123', 'Main', 'Road']);
      expect(result).toBe('Road');
    });

    test('returns empty string for empty parts', () => {
      const result = AddressUtils.extractSuburbCandidate([]);
      expect(result).toBe('');
    });

    test('skips words with numbers', () => {
      const result = AddressUtils.extractSuburbCandidate(['123', 'Main', '1st', 'Street']);
      expect(result).toBe('Street');
    });
  });

  describe('applyProperCapitalization', () => {
    test('expands all road abbreviations', () => {
      const result = AddressUtils.applyProperCapitalization('123 main rd, test suburb nsw 2000');
      expect(result).toBe('123 Main Road, Test Suburb NSW 2000');
    });

    test('capitalizes state abbreviations', () => {
      const result = AddressUtils.applyProperCapitalization('123 main street, test suburb nsw 2000');
      expect(result).toBe('123 Main Street, Test Suburb NSW 2000');
    });

    test('capitalizes regular words', () => {
      const result = AddressUtils.applyProperCapitalization('123 main street, test suburb other 2000');
      expect(result).toBe('123 Main Street, Test Suburb Other 2000');
    });

    test('handles mixed case input', () => {
      const result = AddressUtils.applyProperCapitalization('123 MAIN st, SYDNEY nsw 2000');
      expect(result).toBe('123 Main Street, Sydney NSW 2000');
    });

    test('handles empty string', () => {
      const result = AddressUtils.applyProperCapitalization('');
      expect(result).toBe('');
    });

    test('expands all road abbreviations in applyProperCapitalization', () => {
      // Test remaining abbreviations that might not be fully covered
      expect(AddressUtils.applyProperCapitalization('123 main rd, suburb nsw 2000')).toBe(
        '123 Main Road, Suburb NSW 2000',
      );
      expect(AddressUtils.applyProperCapitalization('123 main st, suburb nsw 2000')).toBe(
        '123 Main Street, Suburb NSW 2000',
      );
    });

    test('handles abbreviations at word boundaries correctly', () => {
      // Test edge cases with word boundaries - road abbreviations get expanded, state abbreviations get capitalized
      expect(AddressUtils.applyProperCapitalization('rd street')).toBe('Road Street'); // 'rd' at start gets expanded
      expect(AddressUtils.applyProperCapitalization('street rd')).toBe('Street Road'); // 'rd' at end gets expanded
      expect(AddressUtils.applyProperCapitalization('st rd')).toBe('Street Road'); // multiple abbreviations get expanded
    });
  });
});
