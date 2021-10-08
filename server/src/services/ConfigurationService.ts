import EventEmitter from 'events';
import { Connection, DidChangeConfigurationParams } from 'vscode-languageserver';
import { defaultSettings, Settings } from '../../../shared/out';

export default class ConfigurationService extends EventEmitter {
  public configuration: Settings = defaultSettings;
  private connection: Connection;
  private documentSettings: Map<string, Thenable<Settings>> = new Map();
  private globalSettings: Settings = defaultSettings;
  private hasConfigurationCapability = false;

  public constructor(connection: Connection) {
    super();
    this.connection = connection;
  }

  public async changeConfiguration(change: DidChangeConfigurationParams) {
    if (this.hasConfigurationCapability) {
      // Reset all cached document settings
      this.documentSettings.clear();
    } else {
      this.globalSettings = <Settings>(change.settings.daylogLanguageServer || defaultSettings);
    }
    await this.updateConfiguration();
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
    result.then((settings) => (this.configuration = settings));
    return result;
  }

  public removeDocumentSettings(uri: string) {
    this.documentSettings.delete(uri);
  }

  public setConfigurationCapability(has: boolean) {
    this.hasConfigurationCapability = has;
  }

  public async updateConfiguration() {
    this.configuration = await this.connection.workspace.getConfiguration({ section: 'daily-timelog' });
    this.emit('configurationChange', this.configuration);
  }
}
