import { Config } from '../../../../Types';
import { BoundingBox } from '../../../BackendTypes';

export class BoundingBoxUtils {
  static calculateBoundingBox(config: Config): BoundingBox {
    if (config.lat !== undefined && config.long !== undefined) {
      return this.createBoundingBoxFromCenter(config.lat, config.long, config.radius);
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

  static createBoundingBoxFromCenter(lat: number, long: number, radius: number): BoundingBox {
    const deltaLat = radius / 111.0;
    const deltaLng = radius / (111.0 * Math.cos((lat * Math.PI) / 180));

    return {
      bottomLeftLatitude: lat - deltaLat,
      bottomLeftLongitude: long - deltaLng,
      topRightLatitude: lat + deltaLat,
      topRightLongitude: long + deltaLng,
    };
  }

  static hasCompleteBoundingBox(config: Config): boolean {
    return !!(
      config.bottomLeftLatitude !== undefined &&
      config.bottomLeftLongitude !== undefined &&
      config.topRightLatitude !== undefined &&
      config.topRightLongitude !== undefined
    );
  }
}
