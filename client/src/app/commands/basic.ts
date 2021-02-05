import { BasicDayLog, defaultSettings, StructuredLog } from '../../../../shared/out';
import { parse } from 'yaml';
import { env, window, workspace } from 'vscode';
import { readFileSync } from 'fs';
import SummaryGenerator from '../SummaryGenerator';
import { getConfiguration } from '../tools/configuration';

export function startNewDaylog() {
  console.log('Start a new Day!');
}

function getSummaryGenerator(includeUnplanned = false) {
  const text = window.activeTextEditor.document.getText();
  const config = getConfiguration();
  const log: StructuredLog = parse(text);
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
