import { Config, FuelStation } from '../types/Config';
import { BoundingBox } from './BackendTypes';
import { BackendService } from './BackendService';
import { BackendMapper } from './BackendMapper';

/**
 * Repository for fuel station data operations
 */
export class BackendRepository {
  constructor(private backendService: BackendService) {}

  async getValidatedFuelStations(config: Config): Promise<FuelStation[]> {
    const validationResult = await this.backendService.validateConfig(config);

    if (!validationResult.isValid) {
      throw new Error(`Configuration validation failed: ${validationResult.errors.join(', ')}`);
    }

    const boundingBox = this.calculateBoundingBox(config);
    const rawStations = await this.backendService.fetchFuelStationsByLocation(
      config.fuelType!, // Frontend provides defaults, so these are guaranteed to be defined
      config.brands!,
      boundingBox,
    );

    const referenceData = await this.backendService.fetchReferenceData();
    const mapper = new BackendMapper(referenceData);

    let stations = rawStations.map((raw) => mapper.mapToFuelStation(raw));
    stations = this.applyFilters(stations, config);

    return stations;
  }

  private calculateBoundingBox(config: Config): BoundingBox {
    if (config.lat !== undefined && config.long !== undefined) {
      return this.createBoundingBoxFromCenter(config.lat, config.long, config.radius!);
    }

    if (this.hasCompleteBoundingBox(config)) {
      return {
        bottomLeftLatitude: config.bottomLeftLatitude!,
        bottomLeftLongitude: config.bottomLeftLongitude!,
        topRightLatitude: config.topRightLatitude!,
        topRightLongitude: config.topRightLongitude!,
      };
    }

    throw new Error('Invalid location configuration: must provide either lat/long or complete bounding box');
  }

  private createBoundingBoxFromCenter(lat: number, long: number, radius: number): BoundingBox {
    const deltaLat = radius / 111.0;
    const deltaLng = radius / (111.0 * Math.cos((lat * Math.PI) / 180));

    return {
      bottomLeftLatitude: lat - deltaLat,
      bottomLeftLongitude: long - deltaLng,
      topRightLatitude: lat + deltaLat,
      topRightLongitude: long + deltaLng,
    };
  }

  private hasCompleteBoundingBox(config: Config): boolean {
    return !!(
      config.bottomLeftLatitude !== undefined &&
      config.bottomLeftLongitude !== undefined &&
      config.topRightLatitude !== undefined &&
      config.topRightLongitude !== undefined
    );
  }

  private applyFilters(stations: FuelStation[], config: Config): FuelStation[] {
    let filtered = [...stations];

    // Sort
    filtered.sort((a, b) => {
      if (config.sortBy === 'distance') {
        return a.distance - b.distance;
      }
      return a.price - b.price;
    });

    // Filter by distance
    if (config.distance !== undefined) {
      filtered = filtered.filter((station) => station.distance <= config.distance!);
    }

    // Apply limit
    if (config.limit !== undefined) {
      filtered = filtered.slice(0, config.limit);
    }

    return filtered;
  }
}
