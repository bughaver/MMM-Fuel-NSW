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

    let stations = rawStations.map((raw: RawFuelStation) =>
      this.backendMapper.mapToFuelStation(
        raw,
        referenceData.brands.items,
        undefined,
        processedConfig.showTankPrice,
        processedConfig.priceUnit,
      ),
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
    let filteredStations = [...stations];

    // Filter by brands if user specified brands (not empty and not 'SelectAll')
    // 'SelectAll' is added when brands array is empty, meaning get all brands
    if (config.brands.length > 0 && !config.brands.includes('SelectAll')) {
      filteredStations = filteredStations.filter((station) => config.brands.includes(station.brand));
    }

    // Filter out closed stations if showClosedStations is false
    if (!config.showClosedStations) {
      filteredStations = filteredStations.filter((station) => station.isOpenNow);
    }

    // Sort by price (default) or distance
    filteredStations.sort((stationA, stationB) => {
      if (config.sortBy === 'distance') {
        return stationA.distance - stationB.distance;
      }
      return stationA.rawPrice - stationB.rawPrice;
    });

    // Filter by maximum distance if specified
    if (config.distance !== undefined) {
      filteredStations = filteredStations.filter((station) => station.distance <= config.distance!);
    }

    // Limit number of results if specified
    if (config.limit !== undefined) {
      filteredStations = filteredStations.slice(0, config.limit);
    }

    return filteredStations;
  }
}
