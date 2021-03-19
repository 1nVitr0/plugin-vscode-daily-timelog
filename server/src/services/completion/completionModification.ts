import { CompletionItem, InsertReplaceEdit, TextEdit } from 'vscode-languageserver';
import { Scalar } from 'yaml/types';
import { Type } from 'yaml/util';
import { Path, StructuredLog } from '../../../../shared/out';

function _alterTextEdit(edit: TextEdit, newText: string) {
  const prefixLength = edit.newText.indexOf(newText);

  const { range } = edit;
  return {
    newText,
    range: {
      start: { line: range.start.line, character: range.start.character - prefixLength },
      end: range.end,
    },
  };
}

function _alterInsertReplaceEdit(edit: InsertReplaceEdit, newText: string) {
  const prefixLength = edit.newText.indexOf(newText);
  const postfixLength = newText.length - edit.newText.length - prefixLength;
  const { insert, replace } = edit;

  return InsertReplaceEdit.create(
    newText,
    {
      start: { line: insert.start.line, character: insert.start.character - prefixLength },
      end: insert.end,
    },
    {
      start: { line: replace.start.line, character: replace.start.character - prefixLength },
      end: { line: replace.end.line, character: replace.end.character + postfixLength },
    }
  );
}

export function matchContext(
  match: Path<StructuredLog>,
  context: (string | Scalar | null)[],
  matchDepth = true
): boolean {
  for (let i = 0; i < match.length; i++) {
    if (match[i] == '*') continue; // match arbitrary context
    const currentContext = context[i];
    const parsedContext = typeof currentContext == 'string' ? currentContext : currentContext?.value;
    if (match[i] != parsedContext) return false;
  }

  if (!matchDepth || match.length == context.length) return true;
  return false;
}

export function addQuotes(text: string, type?: Scalar.Type, keepEndQuote = true): string {
  switch (type) {
    case Type.QUOTE_DOUBLE:
      return `"${text}` + (keepEndQuote ? '"' : '');
    case Type.QUOTE_SINGLE:
      return `'${text}` + (keepEndQuote ? "'" : '');
    case Type.BLOCK_FOLDED:
    case Type.BLOCK_LITERAL:
    case Type.PLAIN:
    case undefined:
      return text;
  }
}

export function getQuoteOffset(type?: Scalar.Type): number {
  switch (type) {
    case Type.QUOTE_DOUBLE:
    case Type.QUOTE_SINGLE:
      return 1;
    case Type.BLOCK_FOLDED:
    case Type.BLOCK_LITERAL:
    case Type.PLAIN:
    case undefined:
      return 0;
  }
}

export function alterInsertReplaceEdit(edit: TextEdit | InsertReplaceEdit, newText: string) {
  if ('range' in edit) return _alterTextEdit(edit, newText);
  else return _alterInsertReplaceEdit(edit, newText);
}

export function prefixCompletions(
  completions: CompletionItem[],
  prefix: string,
  changeLabels = false
): CompletionItem[] {
  return completions.map((completion) => {
    const altered = { ...completion };
    altered.label = changeLabels ? `${prefix}${completion.label}` : completion.label;
    altered.insertText = completion.insertText ? `${prefix}${completion.insertText}` : `${prefix}${completion.label}`;
    altered.filterText = completion.filterText ? `${prefix}${completion.filterText}` : undefined;
    altered.textEdit = altered.textEdit
      ? alterInsertReplaceEdit(altered.textEdit, `${prefix}${altered.textEdit}`)
      : altered.textEdit;

    return altered;
  });
}

export function postfixCompletions(
  completions: CompletionItem[],
  postfix: string,
  changeLabels = false
): CompletionItem[] {
  return completions.map((completion) => {
    const altered = { ...completion };
    altered.label = changeLabels ? `${completion.label}${postfix}` : completion.label;
    altered.insertText = completion.insertText ? `${completion.insertText}${postfix}` : `${completion.label}${postfix}`;
    altered.textEdit = altered.textEdit
      ? alterInsertReplaceEdit(altered.textEdit, `${altered.textEdit}${postfix}`)
      : altered.textEdit;

    return altered;
  });
}

export function prepostfixCompletions(
  completions: CompletionItem[],
  prefix: string,
  postfix: string,
  changeLabels = false
): CompletionItem[] {
  const prefixed = prefixCompletions(completions, prefix, changeLabels);
  return postfixCompletions(prefixed, postfix, changeLabels);
}
