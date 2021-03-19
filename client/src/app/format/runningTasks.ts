import moment from 'moment';
import { Range, TextDocumentChangeEvent, window } from 'vscode';
import { formatTime } from '../../../../shared/out';

export function onDocumentChange({ contentChanges, document }: TextDocumentChangeEvent) {
  const activeEditor = window.activeTextEditor;
  const includesNewlineChange = contentChanges.some((change) => /\n/.test(change.text));
  if (activeEditor.document.uri !== document.uri || !/.daylog.yml$/.test(document.fileName) || !includesNewlineChange)
    return;

  const cursor = activeEditor.selection.active;
  const lines = document.getText().split(/\r?\n/);
  let runningLine: number = -1;

  for (let i = cursor.line; i > 0; i--) {
    if (!/^ /.test(lines[i])) break;
    if (/^\s+- "~\d+/.test(lines[i])) {
      runningLine = i;
      break;
    }
  }

  if (runningLine >= 0) {
    activeEditor.edit(
      (builder) => {
        const range = new Range(runningLine, 0, runningLine + 1, 0);
        const stopRunning = lines[runningLine].replace(/~\d+:\d+/, formatTime(moment())).replace(': !running', ':');
        builder.replace(range, stopRunning + '\n');
      },
      {
        undoStopBefore: false,
        undoStopAfter: true,
      }
    );
  }
}
