import { ExtensionContext, workspace, window, commands, ConfigurationTarget } from 'vscode';
import { LanguageClient } from 'vscode-languageclient/node';
import contributeCommands from './contribute/commands';
import contributeFormatters from './contribute/formatters';
import contributeLanguageClient from './contribute/languageClient';

let client: LanguageClient;

export function activate(context: ExtensionContext) {
  context.subscriptions.push(...contributeCommands(), ...contributeFormatters());
  client = contributeLanguageClient(context);
  client.start();

  askForJira();
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}

async function askForJira() {
  const configuration = workspace.getConfiguration('daily-timelog');
  const ask = configuration.get('askForJira');
  if (ask) {
    const answer = await window.showInformationMessage(
      'Daily TimeLog now supports Integration for Jira!',
      'Set up now',
      'Do it later'
    );
    if (answer == 'Set up now') commands.executeCommand('daily-timelog.setupJiraToken');
    if (answer == 'Do it later') window.showInformationMessage('Run `Daily TaskLog: Setup Jira` to continue setup.');

    if (answer) configuration.update('askForJira', false, ConfigurationTarget.Global);
  }
}
