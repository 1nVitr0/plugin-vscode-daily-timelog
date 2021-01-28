import { join } from 'path';
import { ExtensionContext, workspace } from 'vscode';
import { LanguageClientOptions } from 'vscode-languageclient';
import { TransportKind, LanguageClient, ServerOptions } from 'vscode-languageclient/node';

export default function contributeLanguageClient(context: ExtensionContext): LanguageClient {
  let serverModule = context.asAbsolutePath(join('server', 'out', 'server.js'));
  let debugOptions = { execArgv: ['--nolazy', '--inspect=6010'] };

  let serverOptions: ServerOptions = {
    run: { module: serverModule, transport: TransportKind.ipc },
    debug: {
      module: serverModule,
      transport: TransportKind.ipc,
      options: debugOptions,
    },
  };

  let clientOptions: LanguageClientOptions = {
    documentSelector: [{ scheme: 'file', language: 'yaml' }],
    synchronize: {
      fileEvents: workspace.createFileSystemWatcher('*.daylog.yml'),
    },
  };

  return new LanguageClient('languageServerExample', 'Language Server Example', serverOptions, clientOptions);
}
