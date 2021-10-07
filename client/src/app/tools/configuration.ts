import { defaultsDeep } from 'lodash';
import { workspace } from 'vscode';
import { CustomParams, defaultSettings, Settings } from '../../../../shared/out';

let configuration: Settings = defaultsDeep(workspace.getConfiguration('daily-timelog'), defaultSettings);

workspace.onDidChangeConfiguration((e) => {
  if (e.affectsConfiguration('daily-timelog')) {
    configuration = defaultsDeep(workspace.getConfiguration('daily-timelog'), defaultSettings);
  }
});

export function getConfiguration(): Settings {
  return configuration;
}

export function getCustomParam(name: string): CustomParams | null {
  return configuration.customParams.find((param) => param.name == name) || null;
}

export function getCustomTaskParam(name: string): CustomParams | null {
  return configuration.customTaskParams.find((param) => param.name == name) || null;
}
