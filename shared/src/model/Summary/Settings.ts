import { RoundingType } from '../RoundingScheme/RoundingScheme';

export type ListTypeBoolean = 'taskList' | 'summary' | boolean;

export interface BasicSettings {
  commonBreaks: string[];
  commonTasks: string[];
  dateFormat: string;
  decimalSeparator: string;
  durationFormat: string;
  durationPrecision: number;
  durationRounding: RoundingType;
  floorBelowMinimumDuration: ListTypeBoolean;
  forceMinimumDuration: ListTypeBoolean;
  includeBreaksInTotal: boolean;
  minimumDuration: number;
  timeFormat: string;
  workDayHours: 8;
}

export interface TaskListSettings extends BasicSettings {
  approximateTotals: boolean;
  includeTotals: boolean;
  taskListDurationFormat: string;
  taskListStructure: string[];
  taskListTitle: string;
}

export interface SummarySettings extends BasicSettings {
  approximateTotals: boolean;
  combineBreaks: ListTypeBoolean;
  includeBreaks: ListTypeBoolean;
  includeTotals: boolean;
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
  overviewFileFormat: string;
}

export type SettingsCustom = Partial<Settings>;
