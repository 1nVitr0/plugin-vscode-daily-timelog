import { CST, Document, Options } from 'yaml';
import { isBreak } from '../../tools/string';
import { ParamType } from '../Settings/Params';
import Settings, { BasicSettings, HistorySettings, JiraSettings, OverviewSettings } from '../Settings/Settings';

export const defaultBasicSettings: BasicSettings = {
  commonTasks: ['Organization', 'Daily', 'Meeting', 'Refactoring', 'Code Review', 'Checking Mails'],
  commonBreaks: ['Lunch', 'Breakfast', 'Coffee', 'Personal'],
  taskGroups: ['organisation', 'review', 'evaluation', 'meeting', 'reseach', 'programming'],
  ticketPrefixes: [],
  customParams: [
    {
      name: 'goals',
      type: ParamType.Array,
      template: '{{nextIndex}}. {{value}}',
      suggestions: ["{{task.tickets ? '[' + task.tickets + '] ' : ''}}{{task.name}}"],
    },
    {
      name: 'achievements',
      type: ParamType.Array,
      template: '{{nextIndex}}. {{value}}',
      suggestions: ["{{task.tickets ? '[' + task.tickets + '] ' : ''}}{{task.name}}"],
    },
  ],
  customTaskParams: [
    { name: 'tickets', type: ParamType.Array },
    { name: 'participants', type: ParamType.Array, template: '@{{value}}' },
    { name: 'link', type: ParamType.String },
  ],
  beginDayMessage: "Let's start!",
  defaultBreakName: 'Breaks',
  workDayHours: 8,
  includeBreaksInTotal: false,
  dateFormat: 'YYYY-MM-DD',
  summaryDateFormat: 'YYYY-MM-DD',
  timeFormat: 'HH:mm',
  durationFormat: 'h\\h ?m\\m?',
  durationPrecision: 15,
  durationRounding: 'round',
  minimumDuration: 15,
  floorBelowMinimumDuration: false,
  forceMinimumDuration: true,
  progressFormat: '{{percentageOrText}}',
  progressCompleteText: 'DONE',
  combineBreaks: true,
  includeBreaks: true,
  workDayHoursStart: '08:00',
  workDayHoursEnd: '17:00',
};

const defaultTaskListSettings: Omit<OverviewSettings, keyof BasicSettings> = {
  taskListTitle: "Today's Tasks",
  taskListDurationFormat:
    '- {{task.tickets ? "[" + task.tickets + "] " : ""}}{{task.name}}{{task.participants ? " with " + task.participants : ""}}: {{duration}}',
  taskListStructure: ['*{{taskListTitle}} - {{date}}*', '', '{{estimatedDurations}}', '', '= {{estimatedTotals}}'],
  summaryTitle: "Today's Summary",
  summaryDurationFormat:
    '- {{task.tickets ? "[" + task.tickets + "] " : ""}}{{task.name}}{{task.participants ? " with " + task.participants : ""}}: {{duration}} {{progress ? "(" + progress + ")" : ""}}',
  summaryStructure: ['*{{summaryTitle}} - {{date}}*', '', '{{durations}}', '', '= {{totals}}'],
  overviewTitle: '',
  overviewStructure: ['{{overviewTitle ? overviewTitle + " - " : ""}}{{ date }}', '', '{{taskList}}', '{{summary}}'],
}

export const defaultJiraSettings: JiraSettings = {
  jiraAccountIds: [],
  jiraDomain: '',
  jiraToken: '',
  jiraUserEmail: '',
  jiraFetchInterval: 30 * 60 * 1000,
  jiraMaxTasks: 50,
  jiraStatus: {},
};

export const defaultHistorySettings: HistorySettings = {
  historyMaxAge: 604800,
};

export const defaultSettings: Settings = {
  ...defaultBasicSettings,
  ...defaultTaskListSettings,
  ...defaultJiraSettings,
  ...defaultHistorySettings,
  autoGenerateOverview: true,
  newDayTemplate: [
    'date: {{currentDate}}',
    '',
    '################################### PLANNING ###################################',
    '',
    'plannedTasks:',
    '  -',
    '',
    '################################### TIME LOG ###################################',
    '',
    'timeLog:',
    '  -  "{{workDayHoursStart}}": !begin {{beginDayMessage}}',
  ],
};

export const yamlCustomTags: Options['customTags'] = [
  {
    tag: '!break',
    identify(node) {
      return typeof node == 'string' && isBreak(node);
    },
    // @ts-ignore weird types in patched yaml version
    resolve(doc: Document, cstNode: CST.Scalar) {
      return `[${cstNode.strValue}]`;
    },
  },
  {
    tag: '!begin',
    identify(node) {
      return typeof node == 'string';
    },
    // @ts-ignore weird types in patched yaml version
    resolve(doc: Document, cstNode: CST.Scalar) {
      return '[begin]';
    },
  },
];
