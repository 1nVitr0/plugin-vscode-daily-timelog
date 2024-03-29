import { RoundingType } from '../RoundingScheme/RoundingScheme';
import { CustomParams } from './Params';

export interface BasicSettings {
  beginDayMessage: string;
  combineBreaks: boolean;
  commonBreaks: string[];
  commonTasks: string[];
  taskGroups: string[];
  ticketPrefixes: string[];
  customParams: CustomParams[];
  customTaskParams: CustomParams[];
  dateFormat: string;
  defaultBreakName: string;
  durationFormat: string;
  durationPrecision: number;
  durationRounding: RoundingType;
  floorBelowMinimumDuration: boolean;
  forceMinimumDuration: boolean;
  includeBreaks: boolean;
  includeBreaksInTotal: boolean;
  minimumDuration: number;
  progressCompleteText: string;
  progressFormat: string;
  summaryDateFormat: string;
  timeFormat: string;
  workDayHours: 8;
  workDayHoursEnd: string;
  workDayHoursStart: string;
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

export interface JiraSettings {
  jiraAccountIds: string[];
  jiraDomain: string;
  jiraUserEmail: string;
  jiraFetchInterval: number;
  jiraMaxTasks: number;
  jiraStatus: Record<string, { icon: string; priority: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 }>;
}

export interface HistorySettings {
  historyMaxAge: number;
}

export default interface Settings extends TaskListSettings, SummarySettings, OverviewSettings, JiraSettings, HistorySettings {
  autoGenerateOverview: boolean;
  newDayTemplate: string[];
}

export type SettingsCustom = Partial<Settings>;
