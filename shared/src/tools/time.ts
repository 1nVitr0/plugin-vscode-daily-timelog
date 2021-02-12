import moment, { Moment, Duration } from 'moment';
import { defaultBasicSettings } from '../model/Defaults';
import { formatString, parseString } from './string';

export function validateDate(date: string, settings = defaultBasicSettings): boolean {
  const parsed = moment(date, settings.dateFormat);
  return parsed.format(settings.dateFormat) === date;
}

export function parseDate(date: string, settings = defaultBasicSettings): Moment {
  return moment(date, settings.dateFormat);
}

export function formatDate(date: Moment, settings = defaultBasicSettings, summary = false): string {
  return date.format(summary ? settings.summaryDateFormat : settings.dateFormat);
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
  return moment(time, settings.timeFormat);
}

export function formatTime(time: Moment, settings = defaultBasicSettings): string {
  return time.format(settings.timeFormat);
}

export function formatProgress(progress: number, settings = defaultBasicSettings): string {
  const percentageOnly = Math.round(progress * 100).toString();
  const params = {
    value: progress.toString(),
    percentageOnly,
    percentage: `${percentageOnly}%`,
    percentageOrText: progress >= 1 ? settings.progressCompleteText : `${percentageOnly}%`,
    percentageOnlyOrText: progress >= 1 ? settings.progressCompleteText : percentageOnly,
  };

  return formatString(settings.progressFormat, params);
}

export function formatDuration(_duration: Duration | number, settings = defaultBasicSettings) {
  const duration = typeof _duration === 'number' ? moment.duration(_duration, 'm') : _duration;
  const H = duration.asHours();
  const h = Math.floor(H);
  const M = Math.floor(duration.asMinutes());
  const m = Math.floor(M) - h * 60;

  return formatString(settings.durationFormat, { H, h, M, m });
}
