import Settings, { BasicSettings } from '../Summary/Settings';

export const defaultBasicSettings: BasicSettings = {
  commonTasks: ['Organisation', 'Daily', 'Meeting', 'Refactoring', 'Code Review', 'Checking Mails'],
  commonBreaks: ['Lunch', 'Breakfast', 'Coffee', 'Personal'],
  workDayHours: 8,
  includeBreaksInTotal: false,
  dateFormat: 'YYYY-MM-DD',
  timeFormat: 'HH:mm',
  durationFormat: '{{h}}h ?{{m}}m?',
  decimalSeparator: '.',
  durationPrecision: 15,
  durationRounding: 'round',
  minimumDuration: 15,
  floorBelowMinimumDuration: false,
  forceMinimumDuration: true,
};

export const defaultSettings: Settings = {
  ...defaultBasicSettings,

  includeBreaks: false,
  includeTotals: true,
  approximateTotals: true,
  combineBreaks: true,

  taskListTitle: "Today's Tasks",
  taskListDurationFormat: '',
  taskListStructure: ['*{{taskListTitle}} - {{date}}*\n', '{{estimatedDurations}}', '={{estimatedTotals}}'],
  summaryTitle: "Today's Summary",
  summaryDurationFormat: '',
  summaryStructure: ['*{{summaryTitle}} - {{date}}*\n', '{{durations}}', '={{totals}}'],
  overviewTitle: '',
  overviewStructure: ['{{overviewTitle}}\n?', '{{taskList}}', '{{summary}}'],

  overviewFileFormat: 'log',
  autoGenerateOverview: true,
};
