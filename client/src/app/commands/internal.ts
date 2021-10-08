import { Position, Selection, TextEditor } from 'vscode';

export function goToEndOfPreviousLine(textEditor: TextEditor) {
  const cursor = textEditor.selection.anchor;
  const previousLine = textEditor.document.validatePosition(new Position(cursor.line - 1, Infinity));

  textEditor.selection = new Selection(previousLine, previousLine);
}
