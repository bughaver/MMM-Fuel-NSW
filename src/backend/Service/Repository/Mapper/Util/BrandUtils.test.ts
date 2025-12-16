import { BrandUtils } from './BrandUtils';

describe('BrandUtils', () => {
  const mockBrands = [
    { description: 'BP', isactive: true, logoimageurl: 'bp.png' },
    { description: 'Shell', isactive: true, logoimageurl: 'shell.png' },
    { description: 'Metro Fuel', isactive: true, logoimageurl: 'metro.png' },
    { description: 'Budget', isactive: true, logoimageurl: 'budget.png' },
    { description: '7-Eleven', isactive: true, logoimageurl: '7eleven.png' },
    { description: 'Costco', isactive: true, logoimageurl: 'costco.png' },
    { description: 'Inactive Brand', isactive: false, logoimageurl: 'inactive.png' },
  ];

  describe('getLogoUrl', () => {
    test('returns logo URL for active brand', () => {
      const result = BrandUtils.getLogoUrl(mockBrands, 'BP');
      expect(result).toBe('bp.png');
    });

    test('returns logo URL for another active brand', () => {
      const result = BrandUtils.getLogoUrl(mockBrands, 'Shell');
      expect(result).toBe('shell.png');
    });

    test('returns undefined for inactive brand', () => {
      const result = BrandUtils.getLogoUrl(mockBrands, 'Inactive Brand');
      expect(result).toBeUndefined();
    });

    test('returns undefined for unknown brand', () => {
      const result = BrandUtils.getLogoUrl(mockBrands, 'Unknown Brand');
      expect(result).toBeUndefined();
    });

    test('returns undefined for empty string', () => {
      const result = BrandUtils.getLogoUrl(mockBrands, '');
      expect(result).toBeUndefined();
    });

    test('only includes active brands in mapping', () => {
      // Active brands should be available
      expect(BrandUtils.getLogoUrl(mockBrands, 'BP')).toBe('bp.png');
      expect(BrandUtils.getLogoUrl(mockBrands, 'Shell')).toBe('shell.png');

      // Inactive brand should not be available
      expect(BrandUtils.getLogoUrl(mockBrands, 'Inactive Brand')).toBeUndefined();
    });

    test('handles empty brands array', () => {
      const result = BrandUtils.getLogoUrl([], 'Any Brand');
      expect(result).toBeUndefined();
    });

    test('handles brands with empty descriptions', () => {
      const brandsWithEmptyDesc = [
        { description: '', isactive: true, logoimageurl: 'empty.png' },
        { description: 'Valid Brand', isactive: true, logoimageurl: 'valid.png' },
      ];

      expect(BrandUtils.getLogoUrl(brandsWithEmptyDesc, '')).toBe('empty.png');
      expect(BrandUtils.getLogoUrl(brandsWithEmptyDesc, 'Valid Brand')).toBe('valid.png');
    });
  });
});
