/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import { TextDocument } from "vscode-languageserver-textdocument";
import {
  createConnection,
  DidChangeConfigurationNotification,
  InitializeParams,
  InitializeResult,
  NotificationType,
  ParameterStructures,
  ProposedFeatures,
  TextDocuments,
  TextDocumentSyncKind,
} from "vscode-languageserver/node";
import CompletionService from "./services/CompletionService";
import ConfigurationService from "./services/ConfigurationService";
import HistoryService from "./services/HistoryService";
import JiraTaskService from "./services/JiraTaskService";
import ValidationService from "./services/ValidationService";
import { LanguageServerNotification } from "../../shared/out";

// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
const connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager.
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);
const configurationService = new ConfigurationService(connection);
const taskService = new JiraTaskService(configurationService);
const historyService = new HistoryService(connection, configurationService);
const completionService = new CompletionService(documents, configurationService, taskService, historyService);
const validationService = new ValidationService(documents, configurationService);

let rootPath: string | null | undefined = undefined;
let hasConfigurationCapability: boolean = false;
let hasWorkspaceFolderCapability: boolean = false;
let hasDiagnosticRelatedInformationCapability: boolean = false;

connection.onInitialize((params: InitializeParams) => {
  const capabilities = params.capabilities;

  // Does the client support the `workspace/configuration` request?
  // If not, we fall back using global settings.
  rootPath = params.rootPath;
  hasConfigurationCapability = !!(capabilities.workspace && !!capabilities.workspace.configuration);
  configurationService.setConfigurationCapability(hasConfigurationCapability);
  hasWorkspaceFolderCapability = !!(capabilities.workspace && !!capabilities.workspace.workspaceFolders);
  hasDiagnosticRelatedInformationCapability = !!(
    capabilities.textDocument &&
    capabilities.textDocument.publishDiagnostics &&
    capabilities.textDocument.publishDiagnostics.relatedInformation
  );

  const result: InitializeResult = {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      // Tell the client that this server supports code completion.
      completionProvider: {
        resolveProvider: true,
        triggerCharacters: ["'", '"', " "],
      },
    },
  };
  if (hasWorkspaceFolderCapability) {
    result.capabilities.workspace = {
      workspaceFolders: {
        supported: true,
      },
    };
  }
  return result;
});

connection.onInitialized(() => {
  if (hasConfigurationCapability) {
    // Register for all configuration changes.
    connection.client.register(DidChangeConfigurationNotification.type, undefined);
    configurationService.updateConfiguration();
  }
  if (hasWorkspaceFolderCapability) {
    connection.workspace.onDidChangeWorkspaceFolders((_event) => {
      // historyService.init(rootPath);
    });
  }
  historyService.init(rootPath);
});

connection.onDidChangeConfiguration(async (change) => {
  await configurationService.changeConfiguration(change);
  documents.all().forEach((document) => {
    validationService.for(document).then((validate) => {
      connection.sendDiagnostics({
        uri: document.uri,
        diagnostics: validate.doValidation(),
      });
    });
  });
});

connection.onNotification(
  new NotificationType<string>(LanguageServerNotification.SetJiraToken, ParameterStructures.byPosition),
  taskService.setToken.bind(taskService),
);

// Only keep settings for open documents
documents.onDidClose((e) => {
  configurationService.removeDocumentSettings(e.document.uri);
});

connection.onExit(() => {
  taskService.destroy();
});

connection.onDidChangeWatchedFiles((_change) => {
  // Monitored files have change in VSCode
  connection.console.log("We received an file change event");
});

documents.onDidChangeContent(async (change) => {
  connection.sendDiagnostics({
    uri: change.document.uri,
    diagnostics: (await validationService.for(change.document)).doValidation(),
  });
});

// This handler provides the initial list of the completion items.
connection.onCompletion(async (_textDocumentPosition) => {
  const { textDocument, position } = _textDocumentPosition;
  return (await completionService.for(textDocument)).doComplete(position);
});

connection.onCompletionResolve((completion) => completionService.resolveCompletion(completion));

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();
