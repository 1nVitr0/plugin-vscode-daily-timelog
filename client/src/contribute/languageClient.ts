import { join } from 'path';
import { ExtensionContext, workspace } from 'vscode';
import { LanguageClientOptions, NotificationType, ParameterStructures, State } from "vscode-languageclient";
import { TransportKind, LanguageClient, ServerOptions } from 'vscode-languageclient/node';
import { LanguageServerNotification, Secrets } from "../../../shared/out";

export default function contributeLanguageClient(context: ExtensionContext): LanguageClient {
  const secrets = context.secrets as Secrets;
  let serverModule = context.asAbsolutePath(join("server", "out", "server.js"));
  let debugOptions = { execArgv: ["--nolazy", "--inspect=6010"] };

  let serverOptions: ServerOptions = {
    run: { module: serverModule, transport: TransportKind.ipc },
    debug: {
      module: serverModule,
      transport: TransportKind.ipc,
      options: debugOptions,
    },
  };

  let clientOptions: LanguageClientOptions = {
    documentSelector: [{ language: "yaml", pattern: "**/*.daylog.yml" }],
    synchronize: {
      fileEvents: workspace.createFileSystemWatcher("**/*.daylog.yml"),
    },
  };

  const client = new LanguageClient("daylogLanguageServer", "Daylog Language Server", serverOptions, clientOptions);

  client.onDidChangeState(async ({ newState }) => {
    if (newState !== State.Running) return;

    // Initialize Jira Token
    client.sendNotification(
      new NotificationType<string>(LanguageServerNotification.SetJiraToken, ParameterStructures.byPosition),
      await secrets.get("jiraToken")
    );

    secrets.onDidChange(({ key }) => {
      switch (key) {
        case "jiraToken":
          const token = secrets.get("jiraToken");
          return void client.sendRequest(LanguageServerNotification.SetJiraToken, token);
      }
    });
  });

  return client;
}
