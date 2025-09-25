import { FuelStation } from '../types/Config';
import { ReferenceData, RawFuelStation, TradingHour, BrandItem } from './BackendTypes';

/**
 * Maps raw API data to domain objects
 */
export class BackendMapper {
  private brandMap: Map<string, string>;

  constructor(referenceData: ReferenceData) {
    this.brandMap = this.createBrandMap(referenceData.brands.items);
  }

  mapToFuelStation(rawStation: RawFuelStation): FuelStation {
    const todayHours = rawStation.tradinghours?.find((h) => h.Day === rawStation.Day);

    return {
      name: rawStation.Name,
      brand: rawStation.Brand,
      location: this.extractLocationName(rawStation.Name, rawStation.Brand, rawStation.Address),
      address: this.normalizeAddress(rawStation.Address),
      price: rawStation.Price,
      distance: rawStation.Distance,
      fieldType: rawStation.FuelType,
      isOpenNow: todayHours?.IsOpenNow ?? false,
      isClosingSoon: this.isClosingSoon(todayHours),
      logoUrl: this.brandMap.get(rawStation.Brand),
    };
  }

  private createBrandMap(brands: BrandItem[]): Map<string, string> {
    const map = new Map<string, string>();
    brands.forEach((brand) => {
      if (brand.isactive) {
        map.set(brand.description, brand.logoimageurl);
      }
    });
    return map;
  }

  private extractLocationName(name: string, brand?: string, address?: string): string {
    let cleanedName = name;

    // Remove brand prefix if present (API brand field)
    if (brand) {
      const brandLower = brand.toLowerCase();
      const nameLower = cleanedName.toLowerCase();

      // Try exact brand match first
      if (nameLower.startsWith(brandLower)) {
        cleanedName = cleanedName.substring(brand.length).trim();
        if (cleanedName.startsWith('-') || cleanedName.startsWith('/')) {
          cleanedName = cleanedName.substring(1).trim();
        }
      } else {
        // Try matching first word of brand (e.g., "Metro" from "Metro Fuel")
        const firstBrandWord = brandLower.split(' ')[0];
        if (nameLower.startsWith(firstBrandWord + ' ')) {
          // Find where to cut - look for common patterns after brand
          const afterBrand = nameLower.substring(firstBrandWord.length + 1);
          // Look for patterns like "petrol", "fuel", "service", etc.
          const brandSuffixes = ['petrol', 'fuel', 'service', 'roadhouse', 'express'];
          let cutIndex = -1;

          for (const suffix of brandSuffixes) {
            const suffixIndex = afterBrand.toLowerCase().indexOf(suffix.toLowerCase());
            if (suffixIndex !== -1) {
              // Find the end of the word containing this suffix
              const wordEnd = afterBrand.indexOf(' ', suffixIndex + suffix.length);
              cutIndex = firstBrandWord.length + 1 + (wordEnd === -1 ? afterBrand.length : wordEnd);
              break;
            }
          }

          if (cutIndex > 0 && cutIndex < nameLower.length) {
            cleanedName = cleanedName.substring(cutIndex).trim();
            if (cleanedName.startsWith('-') || cleanedName.startsWith('/')) {
              cleanedName = cleanedName.substring(1).trim();
            }
          }
        }
      }
    }

    // If we have address information, try to combine name and address for better location
    if (address) {
      const normalizedAddress = this.normalizeAddress(address);
      const combinedLocation = this.combineNameAndAddress(cleanedName, normalizedAddress);
      return this.toPascalCase(combinedLocation);
    }

    return this.toPascalCase(cleanedName);
  }

  private combineNameAndAddress(name: string, address: string): string {
    // Extract suburb from address
    // Try comma-separated format first, then fallback to space-separated
    let suburbMatch = address.match(/,\s*([^,]+)\s+NSW\s+\d{4}/i);
    let suburb = suburbMatch ? suburbMatch[1].trim() : '';

    // If no comma found, try to extract suburb before NSW postcode
    if (!suburb) {
      suburbMatch = address.match(/(\w+(?:\s+\w+)*)\s+NSW\s+\d{4}/i);
      if (suburbMatch) {
        const fullMatch = suburbMatch[1].trim();
        const parts = fullMatch.split(/\s+/);

        // Look for suburb patterns: prefer single word or words that don't look like street addresses
        // Common suburb patterns: single word, or words containing direction indicators, or ending with common suburb suffixes
        let suburbCandidate = '';

        // Check if the last word looks like a suburb (doesn't contain numbers, isn't a road type)
        const lastWord = parts[parts.length - 1];
        if (
          lastWord &&
          !/\d/.test(lastWord) &&
          !/^(road|street|avenue|drive|place|lane|way|highway|close|court|terrace|parade|grove|hill|circuit|boulevard)$/i.test(
            lastWord,
          )
        ) {
          suburbCandidate = lastWord;
        }

        // If last word is a direction, include the word before it too
        if (parts.length >= 2) {
          const secondLastWord = parts[parts.length - 2];
          if (/^(north|south|east|west|central|inner|outer|upper|lower)$/i.test(secondLastWord)) {
            suburbCandidate = `${secondLastWord} ${lastWord}`;
          }
        }

        if (suburbCandidate) {
          suburb = suburbCandidate;
        } else {
          // Fallback: take the last word
          suburb = lastWord;
        }
      }
    }

    if (!suburb) {
      // If we can't extract suburb from address, just clean up the name
      return name.replace(/\s*\([^)]*\)\s*/g, '').trim();
    }

    // Clean up the name (remove extra info in parentheses, brand prefixes already removed)
    const cleanName = name.replace(/\s*\([^)]*\)\s*/g, '').trim();

    // If the cleaned name contains the suburb, check for additional directions
    const suburbLower = suburb.toLowerCase();
    const nameLower = cleanName.toLowerCase();

    if (nameLower.includes(suburbLower)) {
      // Find the position where suburb ends in the name
      const suburbIndex = nameLower.indexOf(suburbLower);
      const suburbEndIndex = suburbIndex + suburbLower.length;

      // Get the remaining part after the suburb
      const remainingPart = cleanName.substring(suburbEndIndex).trim();

      // Check if there's a direction word at the start of the remaining part
      const directionMatch = remainingPart.match(/^\s*(north|south|east|west)\b/i);

      if (directionMatch) {
        // Add the direction to the suburb
        return `${suburb} ${directionMatch[1].charAt(0).toUpperCase() + directionMatch[1].slice(1).toLowerCase()}`;
      }

      // No additional direction, just return the suburb
      return suburb;
    }

    // Name doesn't contain suburb, check if name looks like a location
    // Only consider it a location name if it contains location-specific keywords
    const seemsLikeLocationName =
      cleanName.toLowerCase().includes('park') ||
      cleanName.toLowerCase().includes('point') ||
      cleanName.toLowerCase().includes('beach') ||
      cleanName.toLowerCase().includes('centre') ||
      cleanName.toLowerCase().includes('center') ||
      cleanName.toLowerCase().includes('avenue') ||
      cleanName.toLowerCase().includes('street') ||
      cleanName.toLowerCase().includes('road') ||
      cleanName.toLowerCase().includes('drive') ||
      cleanName.toLowerCase().includes('place') ||
      cleanName.toLowerCase().includes('lane') ||
      cleanName.toLowerCase().includes('way') ||
      cleanName.toLowerCase().includes('highway') ||
      cleanName.toLowerCase().includes('bay') ||
      cleanName.toLowerCase().includes('cove') ||
      cleanName.toLowerCase().includes('hill') ||
      cleanName.toLowerCase().includes('mountain') ||
      cleanName.toLowerCase().includes('valley') ||
      cleanName.toLowerCase().includes('ridge') ||
      cleanName.toLowerCase().includes('heights') ||
      cleanName.toLowerCase().includes('downs') ||
      cleanName.toLowerCase().includes('estate') ||
      cleanName.toLowerCase().includes('village') ||
      cleanName.toLowerCase().includes('crossing') ||
      cleanName.toLowerCase().includes('junction') ||
      cleanName.toLowerCase().includes('corner');

    if (seemsLikeLocationName) {
      return cleanName;
    }

    // Default to suburb from address
    return suburb;
  }

  toPascalCase(str: string): string {
    return str
      .toLowerCase()
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .trim();
  }

  isClosingSoon(todayHours?: TradingHour): boolean {
    if (!todayHours || todayHours.IsOpen24Hours) {
      return false;
    }

    const endTime = this.parseTime(todayHours.EndTime);
    const now = new Date();
    const diff = endTime.getTime() - now.getTime();

    return diff > 0 && diff <= 60 * 60 * 1000; // 1 hour
  }

  parseTime(timeStr: string): Date {
    const [time, period] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
  }

  normalizeAddress(address: string | undefined): string {
    if (!address) return '';

    let normalized = address;

    // Clean up multiple commas and spaces between them
    normalized = normalized.replace(/,+\s*,+/g, ',');

    // Standardize suburb/state separator early
    normalized = normalized.replace(/\s*,\s*/, ', ');

    // Clean up multiple spaces
    normalized = normalized.replace(/\s+/g, ' ').trim();

    // Convert to title case (proper capitalization)
    normalized = normalized
      .toLowerCase()
      .split(' ')
      .map((word) => {
        // Always capitalize state abbreviations
        const lowerWord = word.toLowerCase();
        if (
          lowerWord === 'nsw' ||
          lowerWord === 'act' ||
          lowerWord === 'qld' ||
          lowerWord === 'wa' ||
          lowerWord === 'sa' ||
          lowerWord === 'nt' ||
          lowerWord === 'tas' ||
          lowerWord === 'vic'
        ) {
          return word.toUpperCase();
        }
        // Capitalize all words for proper title case
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' ');

    // Standardize road type abbreviations
    const roadAbbreviations: { [key: string]: string } = {
      rd: 'Road',
      st: 'Street',
      ave: 'Avenue',
      av: 'Avenue',
      dr: 'Drive',
      ct: 'Court',
      pl: 'Place',
      ln: 'Lane',
      way: 'Way',
      hwy: 'Highway',
      hw: 'Highway',
      cres: 'Crescent',
      cl: 'Close',
      pde: 'Parade',
      sq: 'Square',
      terr: 'Terrace',
      bvd: 'Boulevard',
      cir: 'Circle',
      gr: 'Grove',
      hill: 'Hill',
    };

    // Replace abbreviations with full forms
    Object.entries(roadAbbreviations).forEach(([abbr, full]) => {
      const regex = new RegExp(`\\b${abbr}\\b`, 'gi');
      normalized = normalized.replace(regex, full);
    });

    // Standardize corner abbreviations
    normalized = normalized.replace(/\bcnr\b/gi, 'Corner');
    normalized = normalized.replace(/\b&\b/g, '&');

    return normalized;
  }
}
