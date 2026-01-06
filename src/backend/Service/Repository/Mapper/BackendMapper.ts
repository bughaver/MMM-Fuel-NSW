import { FuelStation } from '../../../../Types';
import { RawFuelStation, BrandItem } from '../../../BackendTypes';
import { AddressUtils } from './Util/AddressUtils';
import { LocationUtils } from './Util/LocationUtils';
import { TimeUtils } from './Util/TimeUtils';
import { BrandUtils } from './Util/BrandUtils';

type CurrencyStyle = Intl.NumberFormatOptions;

export class BackendMapper {
  private addressUtils: typeof AddressUtils;
  private locationUtils: typeof LocationUtils;
  private timeUtils: typeof TimeUtils;

  constructor() {
    this.addressUtils = AddressUtils;
    this.locationUtils = LocationUtils;
    this.timeUtils = TimeUtils;
  }

  private getPriceStyle(): CurrencyStyle {
    return {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    };
  }

  private formatPrice(price: number, priceUnit: 'cents' | 'dollars'): string {
    if (priceUnit === 'cents') {
      return `${price.toFixed(2)}c`;
    }
    // For dollars, convert cents to dollars exactly (no rounding) with 4 decimal places and dollar sign
    return `$${(price / 100).toFixed(4)}`;
  }

  private formatTankPrice(tankPrice: number, priceUnit: 'cents' | 'dollars'): string {
    if (priceUnit === 'cents') {
      return `${tankPrice}c`;
    }
    return tankPrice.toLocaleString('en-AU', this.getPriceStyle());
  }

  mapToFuelStation(
    rawStation: RawFuelStation,
    brands: BrandItem[],
    currentTime: Date = new Date(),
    showTankPrice?: number,
    priceUnit: 'cents' | 'dollars' = 'dollars',
  ): FuelStation {
    const todayHours = rawStation.tradinghours?.find((h) => h.Day === rawStation.Day);
    const logoUrl = BrandUtils.getLogoUrl(brands, rawStation.Brand);

    const rawTankPrice = showTankPrice ? (rawStation.Price / 100) * showTankPrice : undefined;

    return {
      name: rawStation.Name,
      brand: rawStation.Brand,
      location: this.extractLocationName(rawStation.Name, rawStation.Address, rawStation.Brand),
      address: this.addressUtils.normalizeAddress(rawStation.Address),
      price: this.formatPrice(rawStation.Price, priceUnit),
      rawPrice: rawStation.Price,
      distance: rawStation.Distance,
      fieldType: rawStation.FuelType,
      isOpenNow: todayHours?.IsOpenNow ?? false,
      isClosingSoon: this.timeUtils.isClosingSoon(todayHours, currentTime),
      logoUrl,
      tankPrice: rawTankPrice !== undefined ? this.formatTankPrice(rawTankPrice, 'dollars') : undefined,
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
