export interface ReferenceData {
  brands: { items: BrandItem[] };
  fueltypes: { items: FuelTypeItem[] };
}

export interface BrandItem {
  description: string;
  isactive: boolean;
  logoimageurl: string;
}

export interface FuelTypeItem {
  code: string;
  isactive: boolean;
}

export interface RawFuelStation {
  Name: string;
  Brand: string;
  Address: string;
  Price: number;
  Distance: number;
  FuelType: string;
  Day: string;
  tradinghours?: TradingHour[];
}

export interface TradingHour {
  Day: string;
  IsOpenNow: boolean;
  IsOpen24Hours: boolean;
  EndTime: string;
}

export interface BoundingBox {
  bottomLeftLatitude: number;
  bottomLeftLongitude: number;
  topRightLatitude: number;
  topRightLongitude: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}
