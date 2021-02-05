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
  approximateTotals: true,
  combineBreaks: true,
  includeBreaks: false,
  workHoursStart: '08:00',
  workHoursEnd: '17:00',
};

export const defaultSettings: Settings = {
  ...defaultBasicSettings,

  autoGenerateOverview: true,
  includeBreaks: false,
  combineBreaks: true,

  taskListTitle: "Today's Tasks",
  taskListDurationFormat: '{{task.name}}: {{duration}}',
  taskListStructure: ['*{{taskListTitle}} - {{date}}*\n', '{{estimatedDurations}}\n', '={{estimatedTotals}}'],
  summaryTitle: "Today's Summary",
  summaryDurationFormat: '{{task.name}}: {{duration}} ({{error}})',
  summaryStructure: ['*{{summaryTitle}} - {{date}}*\n', '{{durations}}\n', '={{totals}}'],
  overviewTitle: '',
  overviewStructure: ['{{overviewTitle}}\n?', '{{taskList}}', '{{summary}}'],
};
