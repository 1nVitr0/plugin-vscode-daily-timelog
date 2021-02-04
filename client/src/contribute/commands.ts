import { commands, Disposable } from 'vscode';
import { generateOverview, generateSummary, generateTaskList, startNewDaylog } from '../app/commands/basic';
import {
  completeBreakSegment,
  completeWorkSegment,
  startBreakSegment,
  startWorkSegment,
} from '../app/commands/segments';

export default function contributeCommands(): Disposable[] {
  return [
    commands.registerCommand('daily-timelog.startNewDaylog', startNewDaylog),
    commands.registerCommand('daily-timelog.generateTaskList', generateTaskList),
    commands.registerCommand('daily-timelog.generateSummary', generateSummary),
    commands.registerCommand('daily-timelog.generateOverview', generateOverview),
    commands.registerCommand('daily-timelog.startWorkSegment', startWorkSegment),
    commands.registerCommand('daily-timelog.startBreakSegment', startBreakSegment),
    commands.registerCommand('daily-timelog.completeWorkSegment', completeWorkSegment),
    commands.registerCommand('daily-timelog.completeBreakSegment', completeBreakSegment),
  ];
}
