export type Config = {
  fuelType: string;
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
  maxWidth: string;
  showDistance: boolean;
  showAddress: boolean;
  showLogo: boolean;
  showOpenStatus: boolean;
  showFuelType: boolean;
  borderStyle: 'none' | 'individual' | 'all';
  showLastUpdate: boolean;
  displayMode: 'list' | 'static';
  alignment: 'left' | 'center' | 'right';
};

export type FuelStation = {
  name: string;
  brand: string;
  location: string;
  address: string;
  price: number;
  distance: number;
  fieldType: string;
  isOpenNow: boolean;
  isClosingSoon: boolean;
  logoUrl?: string;
};

export type State = {
  lastUpdate: number;
  stations: FuelStation[];
};
