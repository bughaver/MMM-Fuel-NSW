export class AddressUtils {
  private static readonly STATE_ABBREVIATIONS = new Set(['nsw', 'act', 'qld', 'wa', 'sa', 'nt', 'tas', 'vic']);

  private static readonly ROAD_ABBREVIATIONS: Record<string, string> = {
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

  static normalizeAddress(address: string | undefined): string {
    if (!address) return '';

    let normalized = address;
    normalized = normalized.replace(/,+\s*,+/g, ',');
    normalized = normalized.replace(/\s*,\s*/, ', ');
    normalized = normalized.replace(/\s+/g, ' ').trim();
    normalized = this.applyProperCapitalization(normalized);
    normalized = normalized.replace(/\bcnr\b/gi, 'Corner');
    normalized = normalized.replace(/\b&\b/g, '&');

    return normalized;
  }

  static extractSuburbFromAddress(normalizedAddress: string | undefined): string {
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

  static applyProperCapitalization(text: string): string {
    let result = text.toLowerCase();

    Object.entries(this.ROAD_ABBREVIATIONS).forEach(([abbr, full]) => {
      const regex = new RegExp(`\\b${abbr}\\b`, 'gi');
      result = result.replace(regex, full);
    });

    result = result
      .split(' ')
      .map((word) => {
        const lowerWord = word.toLowerCase();

        if (this.STATE_ABBREVIATIONS.has(lowerWord)) {
          return word.toUpperCase();
        }

        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' ');

    return result;
  }
}
