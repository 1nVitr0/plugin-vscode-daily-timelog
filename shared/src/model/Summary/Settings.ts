import { RoundingType } from '../RoundingScheme/RoundingScheme';

export type ListTypeBoolean = 'taskList' | 'summary' | boolean;

export interface BasicSettings {
  workDayHours: 8;
  includeBreaksInTotal: boolean;

  dateFormat: string;
  timeFormat: string;
  durationFormat: string;
  decimalSeparator: string;

  durationPrecision: number;
  durationRounding: RoundingType;
  minimumDuration: number;
  floorBelowMinimumDuration: ListTypeBoolean;
  forceMinimumDuration: ListTypeBoolean;
}

export interface TaskListSettings extends BasicSettings {
  taskListStructure: string[];
  taskListDurationFormat: string;
  taskListTitle: string;

  includeTotals: boolean;
  approximateTotals: boolean;
}

export interface SummarySettings extends BasicSettings {
  summaryStructure: string[];
  summaryDurationFormat: string;
  summaryTitle: string;

  combineBreaks: ListTypeBoolean;
  includeBreaks: ListTypeBoolean;

  includeTotals: boolean;
  approximateTotals: boolean;
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
