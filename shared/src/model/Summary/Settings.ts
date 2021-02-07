import { RoundingType } from '../RoundingScheme/RoundingScheme';

export type ListTypeBoolean = 'taskList' | 'summary' | boolean;
export type ExportFileFormat = 'txt' | 'json' | 'csv' | 'clipboard';

export interface BasicSettings {
  approximateTotals: ListTypeBoolean;
  beginDayMessage: string;
  combineBreaks: ListTypeBoolean;
  commonBreaks: string[];
  commonTasks: string[];
  dateFormat: string;
  decimalSeparator: string;
  defaultBreakName: string;
  durationFormat: string;
  durationPrecision: number;
  durationRounding: RoundingType;
  floorBelowMinimumDuration: ListTypeBoolean;
  forceMinimumDuration: ListTypeBoolean;
  includeBreaks: ListTypeBoolean;
  includeBreaksInTotal: ListTypeBoolean;
  minimumDuration: number;
  summaryDateFormat: string;
  timeFormat: string;
  workDayHours: 8;
  workHoursEnd: string;
  workHoursStart: string;
}

export interface TaskListSettings extends BasicSettings {
  taskListDurationFormat: string;
  taskListStructure: string[];
  taskListTitle: string;
}

export interface SummarySettings extends BasicSettings {
  summaryDurationFormat: string;
  summaryStructure: string[];
  summaryTitle: string;
}

export interface OverviewSettings extends TaskListSettings, SummarySettings {
  overviewStructure: string[];
  overviewTitle: string;
}

export default interface Settings extends TaskListSettings, SummarySettings, OverviewSettings {
  autoGenerateOverview: boolean;
}

export type SettingsCustom = Partial<Settings>;
