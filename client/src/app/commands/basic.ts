import { BasicDayLog, defaultSettings, StructuredLog } from '../../../../shared/src';
import { parse } from 'yaml';
import { env, window } from 'vscode';
import { readFileSync } from 'fs';
import SummaryGenerator from '../SummaryGenerator';

export function startNewDaylog() {
  console.log('Start a new Day!');
}

function getSummaryGenerator() {
  const fn = window.activeTextEditor.document.fileName;
  const text = readFileSync(fn).toString();
  const log: StructuredLog = parse(text);
  const dayLog = BasicDayLog.fromStructuredLog(log);

  return new SummaryGenerator(dayLog, defaultSettings);
}

export function generateTaskList() {
  const summaryGenerator = getSummaryGenerator();

  env.clipboard.writeText(summaryGenerator.generateTaskList());
}

export function generateSummary() {
  const summaryGenerator = getSummaryGenerator();

  env.clipboard.writeText(summaryGenerator.generateSummary());
}

export function generateOverview() {
  const summaryGenerator = getSummaryGenerator();

  env.clipboard.writeText(summaryGenerator.generateOverview());
}
