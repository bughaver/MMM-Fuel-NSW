import { FuelStation } from '../Types';

type CurrencyStyle = Intl.NumberFormatOptions;

export default class FrontendService {
  static getPriceStyle(): CurrencyStyle {
    return {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    };
  }

  static getDistanceStyle(): CurrencyStyle {
    return {
      style: 'decimal',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    };
  }

  static getPrice(station: FuelStation): string {
    return station.price.toLocaleString('en-AU', FrontendService.getPriceStyle());
  }

  static getDistance(station: FuelStation): string {
    return `${station.distance.toLocaleString('en-AU', FrontendService.getDistanceStyle())}km`;
  }

  static getStationName(station: FuelStation): string {
    return station.name;
  }

  static getOpenStatus(station: FuelStation): string {
    if (station.isClosingSoon) {
      return 'Closing Soon';
    } else if (station.isOpenNow) {
      return 'Open';
    } else {
      return 'Closed';
    }
  }

  static getFuelType(station: FuelStation): string {
    return station.fieldType;
  }
}
