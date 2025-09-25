import { Config, FuelStation } from '../types/Config';
import { ReferenceData, RawFuelStation, BoundingBox, ValidationResult } from './BackendTypes';
import { BackendRepository } from './BackendRepository';

/**
 * Main backend service for fuel price operations
 * Combines API client, validation, and orchestration
 */
export class BackendService {
  private readonly baseUrl = 'https://www.fuelcheck.nsw.gov.au/fuel/api/v1/fuel';

  // API methods
  async fetchReferenceData(): Promise<ReferenceData> {
    const response = await fetch(`${this.baseUrl}/refData`);
    if (!response.ok) {
      throw new Error(`Failed to fetch reference data: ${response.status}`);
    }
    return response.json();
  }

  async fetchFuelStationsByLocation(
    fuelType: string,
    brands: string[],
    boundingBox: BoundingBox,
  ): Promise<RawFuelStation[]> {
    const params = new URLSearchParams({
      fuelType,
      brands: brands.length === 0 ? 'SelectAll' : brands.join('|'),
      bottomLeftLatitude: boundingBox.bottomLeftLatitude.toString(),
      bottomLeftLongitude: boundingBox.bottomLeftLongitude.toString(),
      topRightLatitude: boundingBox.topRightLatitude.toString(),
      topRightLongitude: boundingBox.topRightLongitude.toString(),
    });

    const response = await fetch(`${this.baseUrl}/prices/bylocation?${params}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch fuel stations: ${response.status}`);
    }

    return response.json();
  }

  // Validation methods
  async validateConfig(config: Config): Promise<ValidationResult> {
    const errors: string[] = [];

    try {
      const referenceData = await this.fetchReferenceData();

      // Validate fuel type
      const fuelType = config.fuelType ?? 'P95';
      const validFuelTypes = new Set(referenceData.fueltypes.items.filter((ft) => ft.isactive).map((ft) => ft.code));

      if (!validFuelTypes.has(fuelType)) {
        errors.push(`Invalid fuel type: ${fuelType}`);
      }

      // Validate brands
      const brands = config.brands ?? [];
      if (brands.length > 0) {
        const validBrands = new Set(referenceData.brands.items.filter((b) => b.isactive).map((b) => b.description));

        const invalidBrands = brands.filter((brand: string) => !validBrands.has(brand));
        if (invalidBrands.length > 0) {
          errors.push(`Invalid brands: ${invalidBrands.join(', ')}`);
        }
      }
    } catch (error) {
      errors.push(`API validation failed: ${error}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Main orchestration method
  async getFuelStations(config: Config): Promise<FuelStation[]> {
    const repository = new BackendRepository(this);
    return repository.getValidatedFuelStations(config);
  }
}

// Re-export everything for convenience
export { BackendRepository } from './BackendRepository';
export { BackendMapper } from './BackendMapper';
export * from './BackendTypes';
