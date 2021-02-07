import { BasicDayLog, StructuredLog } from '../../../../shared/out';
import { env, window } from 'vscode';
import SummaryGenerator from '../SummaryGenerator';
import { getConfiguration } from '../tools/configuration';
import { parseYaml } from '../tools/parse';

export function startNewDaylog() {
  console.log('Start a new Day!');
}

function getSummaryGenerator(includeUnplanned = false) {
  const text = window.activeTextEditor.document.getText();
  const config = getConfiguration();
  const log: StructuredLog = parseYaml(text);
  const dayLog = BasicDayLog.fromStructuredLog(log, includeUnplanned);

  return new SummaryGenerator(dayLog, config);
}

export function generateTaskList() {
  const summaryGenerator = getSummaryGenerator();

  env.clipboard.writeText(summaryGenerator.generateTaskList());
}

export function generateSummary() {
  const summaryGenerator = getSummaryGenerator(true);

  env.clipboard.writeText(summaryGenerator.generateSummary());
}

export function generateOverview() {
  const summaryGenerator = getSummaryGenerator(true);

  env.clipboard.writeText(summaryGenerator.generateOverview());
}
