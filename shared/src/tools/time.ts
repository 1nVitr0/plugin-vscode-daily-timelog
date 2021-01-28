import moment, { Moment, Duration } from 'moment';
import { defaultBasicSettings } from '../model/Defaults/DefaultSummarySettings';
import DefaultTime from '../model/Defaults/DefaultTime';
import { formatString } from './string';

export function validateDate(date: string, settings = defaultBasicSettings): boolean {
  const parsed = moment(date, settings.dateFormat);
  return parsed.format(settings.dateFormat) === date;
}

export function parseDate(date: string, settings = defaultBasicSettings): Moment {
  return moment(date, settings.dateFormat);
}

export function formatDate(date: Moment, settings = defaultBasicSettings): string {
  return date.format(settings.dateFormat);
}

export function parseDuration(minutes: number, settings = defaultBasicSettings): Duration {
  return moment.duration(minutes, 'm');
}

export function parseTime(time: string, settings = defaultBasicSettings): Moment {
  return moment(DefaultTime.extendTime(time), DefaultTime.extendTimeFormat(settings.timeFormat));
}

export function formatTime(time: Moment, settings = defaultBasicSettings): string {
  return time.format(settings.timeFormat);
}

export function formatDuration(_duration: Duration | number, settings = defaultBasicSettings) {
  const duration = typeof _duration === 'number' ? parseDuration(_duration) : _duration;
  const d = Math.floor(duration.asHours() / settings.workDayHours);
  const h = duration.asHours() - d * settings.workDayHours;
  const m = duration.asMinutes() - (h + d * settings.workDayHours) * 60;

  return formatString(settings.durationFormat, { d, h, m });
}
