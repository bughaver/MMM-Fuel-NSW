export type Config = {
  fuelType: string | string[];
  brands: string[];
  radius: number;
  sortBy: 'price' | 'distance';
  limit: number;
  distance: number;
  lat?: number;
  long?: number;
  bottomLeftLatitude?: number;
  bottomLeftLongitude?: number;
  topRightLatitude?: number;
  topRightLongitude?: number;
  updateIntervalInSeconds: number;
  showDistance: boolean;
  showAddress: boolean;
  showLogo: boolean;
  showOpenStatus: boolean;
  showFuelType: boolean;
  showClosedStations: boolean;
  borderStyle: 'none' | 'individual' | 'all';
  showLastUpdate: boolean;
  displayMode: 'list' | 'static';
  alignment: 'left' | 'center' | 'right';
  showTankPrice?: number;
  priceUnit: 'cents' | 'dollars';
};

export type FuelStation = {
  name: string;
  brand: string;
  location: string;
  address: string;
  price: string;
  rawPrice: number;
  distance: number;
  fieldType: string;
  isOpenNow: boolean;
  isClosingSoon: boolean;
  logoUrl?: string;
  tankPrice?: string;
};

export type State = {
  lastUpdate: number;
  stations: FuelStation[];
};
