export default class DefaultTime {
  public static timeBaseDate = '1970-01-01';

  public static extendTimeFormat(timeFormat: string): string {
    return `YYYY-MM-DD ${timeFormat}`;
  }

  public static extendTime(time: string): string {
    return `${DefaultTime.timeBaseDate} ${time}`;
  }
}
