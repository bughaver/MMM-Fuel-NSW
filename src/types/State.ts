import { FuelStation } from './Config';

export type State = {
  lastUpdate: number;
  stations: FuelStation[];
};
