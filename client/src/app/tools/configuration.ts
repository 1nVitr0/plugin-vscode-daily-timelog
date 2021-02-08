import { defaultsDeep } from 'lodash';
import { workspace } from 'vscode';
import { CustomParams, defaultSettings, Settings } from '../../../../shared/out';

let configuration: Settings = defaultSettings;

workspace.onDidChangeConfiguration((e) => {
  if (e.affectsConfiguration('daily-timelog')) {
    configuration = defaultsDeep(workspace.getConfiguration('daily-timelog'), defaultSettings);
  }
});

export function getConfiguration(): Settings {
  return configuration;
}

export function getCustomParam(name): CustomParams | null {
  for (const param of configuration.customParams) {
    if (param.name == name) return param;
  }

  return null;
}
