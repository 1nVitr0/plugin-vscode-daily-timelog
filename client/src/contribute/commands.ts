import { commands, Disposable } from 'vscode';
import { generateOverview, generateSummary, generateTaskList, startNewDaylog } from '../app/commands/basic';

export default function contributeCommands(): Disposable[] {
  return [
    commands.registerCommand('daily-timelog.startNewDaylog', startNewDaylog),
    commands.registerCommand('daily-timelog.generateTaskList', generateTaskList),
    commands.registerCommand('daily-timelog.generateSummary', generateSummary),
    commands.registerCommand('daily-timelog.generateOverview', generateOverview),
  ];
}
