export class TimeUtils {
  static parseTime(timeStr: string, currentDate: Date = new Date()): Date {
    const [time, period] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    return new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), hours, minutes);
  }

  static isClosingSoon(
    tradingHour: { EndTime: string; IsOpen24Hours: boolean } | undefined,
    currentTime: Date = new Date(),
  ): boolean {
    if (!tradingHour || tradingHour.IsOpen24Hours) {
      return false;
    }

    const endTime = this.parseTime(tradingHour.EndTime, currentTime);
    const diff = endTime.getTime() - currentTime.getTime();

    return diff > 0 && diff <= 60 * 60 * 1000;
  }
}
