import 'module-alias/register';
import { ExtensionContext } from 'vscode';
import { LanguageClient } from 'vscode-languageclient/node';
import contributeCommands from './contribute/commands';
import contributeLanguageClient from './contribute/languageClient';

let client: LanguageClient;

export function activate(context: ExtensionContext) {
  console.log('Started!');
  context.subscriptions.push(...contributeCommands());
  client = contributeLanguageClient(context);
  client.start();
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}
