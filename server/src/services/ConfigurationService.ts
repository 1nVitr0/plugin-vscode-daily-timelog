import { Connection, DidChangeConfigurationParams } from 'vscode-languageserver';
import { defaultSettings, Settings } from '../../../shared/out';

export default class ConfigurationService {
  private connection: Connection;
  private documentSettings: Map<string, Thenable<Settings>> = new Map();
  private globalSettings: Settings = defaultSettings;
  private hasConfigurationCapability = false;

  public constructor(connection: Connection) {
    this.connection = connection;
  }

  public changeConfiguration(change: DidChangeConfigurationParams) {
    if (this.hasConfigurationCapability) {
      // Reset all cached document settings
      this.documentSettings.clear();
    } else {
      this.globalSettings = <Settings>(change.settings.daylogLanguageServer || defaultSettings);
    }
  }

  public getDocumentSettings(resource: string): Thenable<Settings> {
    if (!this.hasConfigurationCapability) {
      return Promise.resolve(this.globalSettings);
    }
    let result = this.documentSettings.get(resource);
    if (!result) {
      result = this.connection.workspace.getConfiguration({
        scopeUri: resource,
        section: 'daily-timelog',
      });
      this.documentSettings.set(resource, result);
    }
    return result;
  }

  public removeDocumentSettings(uri: string) {
    this.documentSettings.delete(uri);
  }

  public setConfigurationCapability(has: boolean) {
    this.hasConfigurationCapability = has;
  }
}
