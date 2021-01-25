import { commands, Disposable } from 'vscode';
import { generateSummary, generateTaskList, startNewDaylog } from '../app/commands/basic';
import {
  completeBreakSegment,
  completeWorkSegment,
  startBreakSegment,
  startWorkSegment,
} from '../app/commands/segments';
import { completeTask, createTask } from '../app/commands/tasks';

export default function contributeCommands(): Disposable[] {
  return [
    commands.registerCommand('daily-timelog.startNewDaylog', startNewDaylog),
    commands.registerCommand('daily-timelog.generateTaskList', generateTaskList),
    commands.registerCommand('daily-timelog.generateSummary', generateSummary),
    commands.registerCommand('daily-timelog.createTask', createTask),
    commands.registerCommand('daily-timelog.completeTask', completeTask),
    commands.registerCommand('daily-timelog.startWorkSegment', startWorkSegment),
    commands.registerCommand('daily-timelog.startBreakSegment', startBreakSegment),
    commands.registerCommand('daily-timelog.completeWorkSegment', completeWorkSegment),
    commands.registerCommand('daily-timelog.completeBreakSegment', completeBreakSegment),
  ];
}
