import moment, { Moment, Duration } from 'moment';
import { defaultBasicSettings } from '../model/Defaults';
import { formatString } from './string';

interface DurationParams {
  H?: number;
  h?: number;
  M?: number;
  m?: number;
}

const durationKeys = ['H', 'M', 'h', 'm'];

function parseDurationString(duration: string, format: string) {
  const parts: { [key in keyof DurationParams]: { content: string } } = {};
  let escaped = false;
  let mapped = false;
  let current = { content: '' };
  let nextPrefix = '';
  for (const char of format) {
    if (char == '\\') escaped = true;
    else if (durationKeys.indexOf(char) >= 0 && !escaped) {
      if (mapped) {
        current = { content: nextPrefix };
        nextPrefix = '';
        mapped = false;
      }
      current.content += '([\\d.]+)';
      parts[char as keyof DurationParams] = current;
      current = parts[char as keyof DurationParams] as { content: string };
      mapped = true;
    } else if (char === '?' && !escaped && mapped) {
      current = { content: '' };
      nextPrefix = '';
      mapped = false;
    } else {
      current.content += char;
      if (char !== '\\') escaped = false;
      if (mapped) nextPrefix += char;
    }
  }

  const result: DurationParams = {};
  for (const key of Object.keys(parts)) {
    const part = parts[key as keyof DurationParams];
    if (!part) continue;

    const regex = new RegExp(part.content.trim());
    const [_, match] = duration.match(regex) || ['', '0'];
    result[key as keyof DurationParams] = parseFloat(match);
  }

  return result;
}

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
  const params = parseDurationString(duration, settings.durationFormat);
  let minutes = 0;
  if ('M' in params && params.M) minutes = params.M;
  else if ('H' in params && params.H) minutes = params.H * 60;
  else {
    if ('h' in params && params.h) minutes += params.h * 60;
    if ('m' in params && params.m) minutes += params.m;
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
  const params: DurationParams = { H, h, M, m };

  let result = '';
  let current = '';
  let escaped = false;
  let mapped = false;
  for (const char of settings.durationFormat) {
    if (char == '\\') escaped = true;
    else if (durationKeys.indexOf(char) >= 0 && !escaped) {
      current += params[char as keyof DurationParams];
      if (params[char as keyof DurationParams]) mapped = true;
    } else if (char === '?' && !escaped) {
      if (mapped) result += current;
      current = '';
      mapped = false;
    } else {
      current += char;
      escaped = false;
    }
  }
  if (current) result += current;

  return result;
}
