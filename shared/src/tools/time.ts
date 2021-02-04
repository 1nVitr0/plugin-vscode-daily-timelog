import moment, { Moment, Duration } from 'moment';
import { defaultBasicSettings } from '../model/Defaults/DefaultSummarySettings';
import DefaultTime from '../model/Defaults/DefaultTime';
import { formatString, parseString } from './string';

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

export function parseDuration(duration: string, settings = defaultBasicSettings): Duration {
  const params = parseString(duration, settings.durationFormat);
  let minutes = 0;
  if ('M' in params && params.M !== undefined) minutes = parseInt(params.M || '0');
  else if ('H' in params && params.H !== undefined) minutes = parseFloat(params.H || '0') * 60;
  else {
    if ('h' in params) minutes += (parseInt(params.h || '0') || 0) * 60;
    if ('m' in params) minutes += parseInt(params.m || '0') || 0;
  }

  return moment.duration(minutes, 'm');
}

export function parseTime(time: string, settings = defaultBasicSettings): Moment {
  return moment(DefaultTime.extendTime(time), DefaultTime.extendTimeFormat(settings.timeFormat));
}

export function formatTime(time: Moment, settings = defaultBasicSettings): string {
  return time.format(settings.timeFormat);
}

export function formatDuration(_duration: Duration | number, settings = defaultBasicSettings) {
  const duration = typeof _duration === 'number' ? moment.duration(_duration, 'm') : _duration;
  const H = duration.asHours();
  const h = Math.floor(H);
  const M = Math.floor(duration.asMinutes());
  const m = Math.floor(M) - h * 60;

  return formatString(settings.durationFormat, { H, h, M, m });
}
