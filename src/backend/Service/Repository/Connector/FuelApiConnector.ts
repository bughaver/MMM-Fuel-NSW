import { ReferenceData, RawFuelStation, BoundingBox } from '../../../BackendTypes';

export class FuelApiConnector {
  private readonly baseUrl = 'https://www.fuelcheck.nsw.gov.au/fuel/api/v1/fuel';

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
      brands: brands.join('|'),
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
}
