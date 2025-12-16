export class LocationUtils {
  private static readonly LOCATION_KEYWORDS = new Set([
    'park',
    'point',
    'beach',
    'centre',
    'center',
    'avenue',
    'street',
    'road',
    'drive',
    'place',
    'lane',
    'way',
    'highway',
    'bay',
    'cove',
    'hill',
    'mountain',
    'valley',
    'ridge',
    'heights',
    'downs',
    'estate',
    'village',
    'crossing',
    'junction',
    'corner',
  ]);

  private static readonly BRAND_SUFFIXES = ['petrol', 'fuel', 'service', 'roadhouse', 'express'];

  static removeBrandPrefix(name: string, brand?: string): string {
    if (!brand) return name;

    const brandLower = brand.toLowerCase();
    const nameLower = name.toLowerCase();

    if (nameLower.startsWith(brandLower)) {
      return this.cleanLeadingSeparators(name.substring(brand.length));
    }

    const firstBrandWord = brandLower.split(' ')[0];
    if (nameLower.startsWith(firstBrandWord + ' ')) {
      const afterBrand = nameLower.substring(firstBrandWord.length + 1);

      for (const suffix of this.BRAND_SUFFIXES) {
        const suffixIndex = afterBrand.toLowerCase().indexOf(suffix.toLowerCase());
        if (suffixIndex !== -1) {
          const wordEnd = afterBrand.indexOf(' ', suffixIndex + suffix.length);
          const cutIndex = firstBrandWord.length + 1 + (wordEnd === -1 ? afterBrand.length : wordEnd);
          if (cutIndex > 0 && cutIndex < nameLower.length) {
            return this.cleanLeadingSeparators(name.substring(cutIndex));
          }
          break;
        }
      }
    }

    return name;
  }

  static combineNameAndAddress(cleanName: string, normalizedAddress: string): string {
    const suburb = this.extractSuburbFromAddress(normalizedAddress);
    if (!suburb) {
      return cleanName.replace(/\s*\([^)]*\)\s*/g, '').trim();
    }

    const cleanNameNoParens = cleanName.replace(/\s*\([^)]*\)\s*/g, '').trim();

    const suburbLower = suburb.toLowerCase();
    const nameLower = cleanNameNoParens.toLowerCase();

    if (nameLower.includes(suburbLower)) {
      const suburbIndex = nameLower.indexOf(suburbLower);
      const suburbEndIndex = suburbIndex + suburbLower.length;

      const remainingPart = cleanNameNoParens.substring(suburbEndIndex).trim();

      const directionMatch = remainingPart.match(/^\s*(north|south|east|west)\b/i);

      if (directionMatch) {
        return `${suburb} ${directionMatch[1].charAt(0).toUpperCase() + directionMatch[1].slice(1).toLowerCase()}`;
      }

      return suburb;
    }

    if (this.seemsLikeLocationName(cleanNameNoParens)) {
      return cleanNameNoParens;
    }

    return suburb;
  }

  static toPascalCase(str: string): string {
    return str
      .toLowerCase()
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .trim();
  }

  static seemsLikeLocationName(name: string): boolean {
    const lowerName = name.toLowerCase();
    return Array.from(this.LOCATION_KEYWORDS).some((keyword) => lowerName.includes(keyword));
  }

  static extractSuburbFromAddress(normalizedAddress: string): string {
    if (!normalizedAddress) return '';

    let suburbMatch = normalizedAddress.match(/,\s*([^,]+)\s+NSW\s+\d{4}/i);
    let suburb = suburbMatch ? suburbMatch[1].trim() : '';

    if (!suburb) {
      suburbMatch = normalizedAddress.match(/(\w+(?:\s+\w+)*)\s+NSW\s+\d{4}/i);
      if (suburbMatch) {
        const fullMatch = suburbMatch[1].trim();
        const parts = fullMatch.split(/\s+/);

        suburb = this.extractSuburbCandidate(parts);
      }
    }

    return suburb;
  }

  static extractSuburbCandidate(parts: string[]): string {
    const lastWord = parts[parts.length - 1];
    if (lastWord && !/\d/.test(lastWord) && !this.isRoadType(lastWord)) {
      let suburbCandidate = lastWord;

      if (parts.length >= 2) {
        const secondLastWord = parts[parts.length - 2];
        if (this.isDirection(secondLastWord)) {
          suburbCandidate = `${secondLastWord} ${lastWord}`;
        }
      }

      return suburbCandidate;
    }

    return lastWord || '';
  }

  static isDirection(word: string): boolean {
    const lowerWord = word.toLowerCase();
    return /^(north|south|east|west|central|inner|outer|upper|lower)$/i.test(lowerWord);
  }

  static isRoadType(word: string): boolean {
    const lowerWord = word.toLowerCase();
    return /^(road|street|avenue|drive|place|lane|way|highway|close|court|terrace|grove|hill|circuit|boulevard)$/i.test(
      lowerWord,
    );
  }

  static cleanLeadingSeparators(str: string): string {
    return str.replace(/^[-/]\s*/, '');
  }
}
