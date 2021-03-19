import { workspace } from 'vscode';
import { Disposable } from 'vscode-languageclient';
import { onDocumentChange } from '../app/format/runningTasks';

export default function contributeFormatters(): Disposable[] {
  return [workspace.onDidChangeTextDocument(onDocumentChange)];
}
