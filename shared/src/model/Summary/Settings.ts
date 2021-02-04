import { RoundingType } from '../RoundingScheme/RoundingScheme';

export type ListTypeBoolean = 'taskList' | 'summary' | boolean;
export type ExportFileFormat = 'txt' | 'json' | 'csv' | 'clipboard';

export interface BasicSettings {
  approximateTotals: ListTypeBoolean;
  commonBreaks: string[];
  commonTasks: string[];
  dateFormat: string;
  decimalSeparator: string;
  durationFormat: string;
  durationPrecision: number;
  durationRounding: RoundingType;
  floorBelowMinimumDuration: ListTypeBoolean;
  forceMinimumDuration: ListTypeBoolean;
  includeBreaksInTotal: ListTypeBoolean;
  includeTotals: ListTypeBoolean;
  minimumDuration: number;
  timeFormat: string;
  workDayHours: 8;
}

export interface TaskListSettings extends BasicSettings {
  taskListDurationFormat: string;
  taskListStructure: string[];
  taskListTitle: string;
}

export interface SummarySettings extends BasicSettings {
  combineBreaks: boolean;
  includeBreaks: boolean;
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
  overviewFileFormat: ExportFileFormat;
}

export type SettingsCustom = Partial<Settings>;
