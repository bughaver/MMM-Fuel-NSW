import { FuelStation } from '../../../../Types';
import { RawFuelStation, BrandItem } from '../../../BackendTypes';
import { AddressUtils } from './Util/AddressUtils';
import { LocationUtils } from './Util/LocationUtils';
import { TimeUtils } from './Util/TimeUtils';
import { BrandUtils } from './Util/BrandUtils';

export class BackendMapper {
  private addressUtils: typeof AddressUtils;
  private locationUtils: typeof LocationUtils;
  private timeUtils: typeof TimeUtils;

  constructor() {
    this.addressUtils = AddressUtils;
    this.locationUtils = LocationUtils;
    this.timeUtils = TimeUtils;
  }

  async mapToFuelStation(
    rawStation: RawFuelStation,
    brands: BrandItem[],
    currentTime: Date = new Date(),
  ): Promise<FuelStation> {
    const todayHours = rawStation.tradinghours?.find((h) => h.Day === rawStation.Day);
    const logoUrl = BrandUtils.getLogoUrl(brands, rawStation.Brand);

    return {
      name: rawStation.Name,
      brand: rawStation.Brand,
      location: this.extractLocationName(rawStation.Name, rawStation.Address, rawStation.Brand),
      address: this.addressUtils.normalizeAddress(rawStation.Address),
      price: rawStation.Price,
      distance: rawStation.Distance,
      fieldType: rawStation.FuelType,
      isOpenNow: todayHours?.IsOpenNow ?? false,
      isClosingSoon: this.timeUtils.isClosingSoon(todayHours, currentTime),
      logoUrl,
    };
  }

  private extractLocationName(name: string, address: string, brand: string): string {
    const cleanedName = this.locationUtils.removeBrandPrefix(name, brand);
    const normalizedAddress = this.addressUtils.normalizeAddress(address);
    const combinedLocation = this.locationUtils.combineNameAndAddress(cleanedName, normalizedAddress);
    const pascalCombined = this.locationUtils.toPascalCase(combinedLocation);
    const pascalCleaned = this.locationUtils.toPascalCase(cleanedName);

    return pascalCombined !== pascalCleaned ? pascalCombined : pascalCleaned;
  }
}
