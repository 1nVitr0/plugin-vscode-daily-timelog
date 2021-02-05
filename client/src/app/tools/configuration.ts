import { defaultsDeep } from 'lodash';
import { workspace } from 'vscode';
import { defaultSettings, Settings } from '../../../../shared/out';

let configuration: Settings = defaultSettings;

workspace.onDidChangeConfiguration((e) => {
  if (e.affectsConfiguration('daily-timelog')) {
    configuration = defaultsDeep(workspace.getConfiguration('daily-timelog'), defaultSettings);
  }
});

export function getConfiguration(): Settings {
  return configuration;
}
