import { CST, Document, Options } from 'yaml';
import { isBreak } from '../../tools/string';
import { ParamType } from '../Settings/Params';
import Settings, { BasicSettings } from '../Settings/Settings';
export const defaultBasicSettings: BasicSettings = {
  commonTasks: ['Organization', 'Daily', 'Meeting', 'Refactoring', 'Code Review', 'Checking Mails'],
  commonBreaks: ['Lunch', 'Breakfast', 'Coffee', 'Personal'],
  customParams: [
    { name: 'goals', type: ParamType.Array, template: '{{nextIndex}}. {{value}}' },
    { name: 'achievements', type: ParamType.Array, template: '{{nextIndex}}. {{value}}' },
  ],
  beginDayMessage: "Let's start!",
  defaultBreakName: 'Breaks',
  workDayHours: 8,
  includeBreaksInTotal: false,
  dateFormat: 'YYYY-MM-DD',
  summaryDateFormat: 'YYYY-MM-DD',
  timeFormat: 'HH:mm',
  durationFormat: '{{h}}h? {{m}}m?',
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

export const defaultSettings: Settings = {
  ...defaultBasicSettings,
  autoGenerateOverview: true,
  taskListTitle: "Today's Tasks",
  taskListDurationFormat: '- {{task.name}}: {{duration}}',
  taskListStructure: ['*{{taskListTitle}} - {{date}}*', '', '{{estimatedDurations}}', '', '= {{estimatedTotals}}'],
  summaryTitle: "Today's Summary",
  summaryDurationFormat: '- {{task.name}}: {{duration}} {{?:progress}}(?{{progress}})?',
  summaryStructure: ['*{{summaryTitle}} - {{date}}*', '', '{{durations}}', '', '= {{totals}}'],
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
  overviewTitle: '',
  overviewStructure: ['{{overviewTitle}} -? {{ date }}', '', '{{taskList}}', '{{summary}}'],
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
