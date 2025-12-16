import { TimeUtils } from './TimeUtils';

describe('TimeUtils', () => {
  describe('parseTime', () => {
    test('parses AM time correctly', () => {
      const result = TimeUtils.parseTime('9:30 AM');
      expect(result.getHours()).toBe(9);
      expect(result.getMinutes()).toBe(30);
    });

    test('parses PM time correctly', () => {
      const result = TimeUtils.parseTime('2:45 PM');
      expect(result.getHours()).toBe(14);
      expect(result.getMinutes()).toBe(45);
    });

    test('handles 12 AM correctly', () => {
      const result = TimeUtils.parseTime('12:00 AM');
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
    });

    test('handles 12 PM correctly', () => {
      const result = TimeUtils.parseTime('12:00 PM');
      expect(result.getHours()).toBe(12);
      expect(result.getMinutes()).toBe(0);
    });
  });

  describe('isClosingSoon', () => {
    test('returns false for 24-hour stations', () => {
      const tradingHour = {
        Day: 'SATURDAY',
        IsOpenNow: true,
        IsOpen24Hours: true,
        EndTime: '12:00 AM',
      };

      const result = TimeUtils.isClosingSoon(tradingHour);
      expect(result).toBe(false);
    });

    test('returns false for stations not closing soon', () => {
      const tradingHour = {
        Day: 'SATURDAY',
        IsOpenNow: true,
        IsOpen24Hours: false,
        EndTime: '12:00 AM', // More than 1 hour from now
      };

      const result = TimeUtils.isClosingSoon(tradingHour);
      expect(result).toBe(false);
    });

    test('returns true for stations closing within 1 hour', () => {
      // Mock a time where the station closes in less than 1 hour
      const mockCurrentTime = new Date();
      mockCurrentTime.setHours(21, 30, 0, 0); // 9:30 PM

      const tradingHour = {
        Day: 'SATURDAY',
        IsOpenNow: true,
        IsOpen24Hours: false,
        EndTime: '10:00 PM', // 30 minutes from now
      };

      const result = TimeUtils.isClosingSoon(tradingHour, mockCurrentTime);
      expect(result).toBe(true);
    });

    test('returns false for stations closing in more than 1 hour', () => {
      // Mock a time where the station closes in more than 1 hour
      const mockCurrentTime = new Date();
      mockCurrentTime.setHours(20, 0, 0, 0); // 8:00 PM

      const tradingHour = {
        Day: 'SATURDAY',
        IsOpenNow: true,
        IsOpen24Hours: false,
        EndTime: '10:00 PM', // 2 hours from now
      };

      const result = TimeUtils.isClosingSoon(tradingHour, mockCurrentTime);
      expect(result).toBe(false);
    });

    test('returns false for undefined trading hours', () => {
      const result = TimeUtils.isClosingSoon(undefined);
      expect(result).toBe(false);
    });

    test('returns false when station is already closed', () => {
      // Mock a time after closing
      const mockCurrentTime = new Date();
      mockCurrentTime.setHours(23, 0, 0, 0); // 11:00 PM

      const tradingHour = {
        Day: 'SATURDAY',
        IsOpenNow: false,
        IsOpen24Hours: false,
        EndTime: '10:00 PM', // Already past
      };

      const result = TimeUtils.isClosingSoon(tradingHour, mockCurrentTime);
      expect(result).toBe(false);
    });
  });
});
