import { Settings } from 'http2';
import { SummarySettings, TaskListSettings } from './Settings';

export enum ParamLocation {
  PlannedTasks = 'plannedTasks',
  TimeLog = 'timeLog',
  Everywhere = 'everywhere',
}

export enum ParamType {
  Array = 'array',
  String = 'string',
  Date = 'date',
  Time = 'time',
  Duration = 'duration',
  Task = 'task',
}

export interface BasicParams extends Settings {
  date: string;
  durations: string;
  estimatedDurations: string;
  estimatedTotals: string;
  totals: string;
}

export interface TaskListParams extends BasicParams, TaskListSettings {
  taskListTitle: string;
}

export interface SummaryParams extends BasicParams, SummarySettings {
  summaryTitle: string;
}

export interface DurationListParams extends TaskListParams, SummaryParams {
  overviewTitle: string;
}

export interface OverviewParams extends DurationListParams {
  summary: string;
  taskList: string;
}

export interface CustomParams {
  items?: ParamType;
  name: string;
  location?: ParamLocation;
  required?: boolean;
  suggestions?: string[];
  template?: string;
  type: ParamType;
  delimiter?: string;
}
