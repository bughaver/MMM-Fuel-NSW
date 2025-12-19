import { Config } from '../../../Types';
import { ReferenceData, ValidationResult } from '../../BackendTypes';

export class ConfigValidationUtils {
  static async validateConfigWithReferenceData(
    config: Config,
    referenceData: ReferenceData,
  ): Promise<ValidationResult> {
    const errors: string[] = [];

    // Validate location configuration
    const hasLatLong = config.lat !== undefined && config.long !== undefined;
    const hasBoundingBox =
      config.bottomLeftLatitude !== undefined &&
      config.bottomLeftLongitude !== undefined &&
      config.topRightLatitude !== undefined &&
      config.topRightLongitude !== undefined;

    if (!hasLatLong && !hasBoundingBox) {
      errors.push('Must provide either lat/long or complete bounding box coordinates');
    } else if (hasLatLong && hasBoundingBox) {
      errors.push('Cannot provide both lat/long and bounding box coordinates');
    }

    const validFuelTypes = new Set(referenceData.fueltypes.items.filter((ft) => ft.isactive).map((ft) => ft.code));

    if (!validFuelTypes.has(config.fuelType)) {
      errors.push(`Invalid fuel type: ${config.fuelType}`);
    }

    if (config.brands.length > 0 && !config.brands.includes('SelectAll')) {
      const validBrands = new Set(referenceData.brands.items.filter((b) => b.isactive).map((b) => b.description));

      const invalidBrands = config.brands.filter((brand: string) => !validBrands.has(brand));
      if (invalidBrands.length > 0) {
        errors.push(`Invalid brands: ${invalidBrands.join(', ')}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
