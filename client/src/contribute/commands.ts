import { commands, Disposable } from 'vscode';
import { startNewDaylog as startNewDay } from '../app/commands/basic';
import { generateOverview, generateSummary, generateTaskList } from '../app/commands/generate';
import { setupJira, setupJiraToken, setupJiraUser, updateJiraTasks } from '../app/commands/jira';
import { goToEndOfPreviousLine } from '../app/commands/internal';

export default function contributeCommands(): Disposable[] {
  return [
    commands.registerCommand('daily-timelog.startNewDay', startNewDay),
    commands.registerCommand('daily-timelog.generateTaskList', generateTaskList),
    commands.registerCommand('daily-timelog.generateSummary', generateSummary),
    commands.registerCommand('daily-timelog.generateOverview', generateOverview),
    commands.registerCommand('daily-timelog.setupJira', setupJira),
    commands.registerCommand('daily-timelog.setupJiraToken', setupJiraToken),
    commands.registerCommand('daily-timelog.setupJiraUser', setupJiraUser),
    commands.registerCommand('daily-timelog.goToEndOfPreviousLine', goToEndOfPreviousLine),
    commands.registerCommand('daily-timelog.updateJiraTasks', updateJiraTasks),
  ];
}
