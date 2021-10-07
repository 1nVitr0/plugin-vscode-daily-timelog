import { BasicDayLog, StructuredLog } from '../../../../shared/out';
import { env, window } from 'vscode';
import SummaryGenerator from '../SummaryGenerator';
import { getConfiguration } from '../tools/configuration';
import { parseYaml } from '../tools/parse';

function getSummaryGenerator(includeUnplanned = false) {
  try {
    const text = window.activeTextEditor.document.getText();
    const config = getConfiguration();
    const log: StructuredLog = parseYaml(text);
    const dayLog = BasicDayLog.fromStructuredLog(log, config.customTaskParams, includeUnplanned);

    return new SummaryGenerator(dayLog, config);
  } catch (e) {
    console.error('Invalid daylog document ', e);
    window.showErrorMessage('Your timelog seems to be invalid! Check the console for more information');
    throw e;
  }
}

export function generateTaskList() {
  const summaryGenerator = getSummaryGenerator();

  try {
    env.clipboard.writeText(summaryGenerator.generateTaskList());
  } catch (e) {
    console.error('[Daily Timelog] Generating task list failed', e);
    window.showErrorMessage('Your timelog seems to be invalid! Check the console for more information');
  }
}

export function generateSummary() {
  const summaryGenerator = getSummaryGenerator(true);

  try {
    env.clipboard.writeText(summaryGenerator.generateSummary());
  } catch (e) {
    console.error('[Daily Timelog] Generating summary list failed', e);
    window.showErrorMessage('Your timelog seems to be invalid! Check the console for more information');
  }
}

export function generateOverview() {
  const summaryGenerator = getSummaryGenerator(true);

  try {
    env.clipboard.writeText(summaryGenerator.generateOverview());
  } catch (e) {
    console.error('[Daily Timelog] Generating overview list failed', e);
    window.showErrorMessage('Your timelog seems to be invalid! Check the console for more information');
  }
}
