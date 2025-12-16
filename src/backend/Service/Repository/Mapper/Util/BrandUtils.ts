import { BrandItem } from '../../../../BackendTypes';

export class BrandUtils {
  static getLogoUrl(brands: BrandItem[], brand: string): string | undefined {
    const brandItem = brands.find((b) => b.isactive && b.description === brand);
    return brandItem?.logoimageurl;
  }
}
