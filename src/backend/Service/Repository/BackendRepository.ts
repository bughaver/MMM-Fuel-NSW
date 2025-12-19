import { Config, FuelStation } from '../../../Types';
import { RawFuelStation, ReferenceData } from '../../BackendTypes';
import { BackendMapper } from './Mapper/BackendMapper';
import { FuelApiConnector } from './Connector/FuelApiConnector';
import { BoundingBoxUtils } from './Util/BoundingBoxUtils';

export class BackendRepository {
  constructor(
    private backendMapper: BackendMapper,
    private fuelApiConnector: FuelApiConnector,
  ) {}

  async getReferenceData(): Promise<ReferenceData> {
    return this.fuelApiConnector.fetchReferenceData();
  }

  async getFuelStations(config: Config): Promise<FuelStation[]> {
    const referenceData = await this.fuelApiConnector.fetchReferenceData();
    const processedConfig = this.processConfigForApi(config);

    const rawStations = await this.fetchFuelStations(processedConfig);

    let stations = await Promise.all(
      rawStations.map((raw: RawFuelStation) => this.backendMapper.mapToFuelStation(raw, referenceData.brands.items)),
    );

    stations = this.applyFilters(stations, processedConfig);
    return stations;
  }

  private processConfigForApi(config: Config): Config {
    const processedConfig = { ...config };

    // If brands is empty, use 'SelectAll' to get all brands from API
    if (processedConfig.brands.length === 0) {
      processedConfig.brands = ['SelectAll'];
    }

    return processedConfig;
  }

  private async fetchFuelStations(config: Config): Promise<RawFuelStation[]> {
    const boundingBox = BoundingBoxUtils.calculateBoundingBox(config);

    return await this.fuelApiConnector.fetchFuelStationsByLocation(config.fuelType!, config.brands, boundingBox);
  }

  private applyFilters(stations: FuelStation[], config: Config): FuelStation[] {
    let filtered = [...stations];

    // Don't filter if brands contains 'SelectAll' (meaning user wants all brands)
    if (config.brands.length > 0 && !config.brands.includes('SelectAll')) {
      filtered = filtered.filter((station) => config.brands.includes(station.brand));
    }

    filtered.sort((a, b) => {
      if (config.sortBy === 'distance') {
        return a.distance - b.distance;
      }
      return a.price - b.price;
    });

    if (config.distance !== undefined) {
      filtered = filtered.filter((station) => station.distance <= config.distance!);
    }

    if (config.limit !== undefined) {
      filtered = filtered.slice(0, config.limit);
    }

    return filtered;
  }
}
