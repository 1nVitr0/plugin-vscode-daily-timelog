import { CST, Document, Options } from 'yaml';
import { isBreak } from '../../tools/string';
import Settings, { BasicSettings } from '../Summary/Settings';
export const defaultBasicSettings: BasicSettings = {
  commonTasks: ['Organisation', 'Daily', 'Meeting', 'Refactoring', 'Code Review', 'Checking Mails'],
  commonBreaks: ['Lunch', 'Breakfast', 'Coffee', 'Personal'],
  beginDayMessage: "Let's start!",
  defaultBreakName: 'Breaks',
  workDayHours: 8,
  includeBreaksInTotal: false,
  dateFormat: 'YYYY-MM-DD',
  timeFormat: 'HH:mm',
  durationFormat: '{{h}}h? {{m}}m?',
  decimalSeparator: '.',
  durationPrecision: 15,
  durationRounding: 'round',
  minimumDuration: 15,
  floorBelowMinimumDuration: false,
  forceMinimumDuration: true,
  approximateTotals: true,
  combineBreaks: true,
  includeBreaks: true,
  workHoursStart: '08:00',
  workHoursEnd: '17:00',
};

export const defaultSettings: Settings = {
  ...defaultBasicSettings,
  autoGenerateOverview: true,
  taskListTitle: "Today's Tasks",
  taskListDurationFormat: '{{task.name}}: {{duration}}',
  taskListStructure: ['*{{taskListTitle}} - {{date}}*\n\n', '{{estimatedDurations}}\n\n', '={{estimatedTotals}}'],
  summaryTitle: "Today's Summary",
  summaryDurationFormat: '{{task.name}}: {{duration}} ({{error}})',
  summaryStructure: ['*{{summaryTitle}} - {{date}}*\n\n', '{{durations}}\n\n', '={{totals}}'],
  overviewTitle: '',
  overviewStructure: ['{{overviewTitle}}\n\n?', '{{taskList}}', '{{summary}}'],
};

export const yamlCustomTags: Options['customTags'] = [
  {
    tag: '!break',
    identify(node) {
      return typeof node == 'string' && isBreak(node);
    },
    resolve(doc: Document, cstNode: CST.Scalar) {
      return `[${cstNode.strValue}]`;
    },
  },
];
