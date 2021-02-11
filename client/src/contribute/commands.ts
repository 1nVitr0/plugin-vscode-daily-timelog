import { commands, Disposable } from 'vscode';
import { startNewDaylog as startNewDay } from '../app/commands/basic';
import { generateOverview, generateSummary, generateTaskList } from '../app/commands/generate';

export default function contributeCommands(): Disposable[] {
  return [
    commands.registerCommand('daily-timelog.startNewDay', startNewDay),
    commands.registerCommand('daily-timelog.generateTaskList', generateTaskList),
    commands.registerCommand('daily-timelog.generateSummary', generateSummary),
    commands.registerCommand('daily-timelog.generateOverview', generateOverview),
  ];
}
