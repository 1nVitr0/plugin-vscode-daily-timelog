import { Settings } from 'http2';
import { SummarySettings, TaskListSettings } from './Settings';

export interface BasicParams extends Settings {
  date: string;
  durations: string;
  estimatedDurations: string;
  totals: string;
  estimatedTotals: string;
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
  taskList: string;
  summary: string;
}
