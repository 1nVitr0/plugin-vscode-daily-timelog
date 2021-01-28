import { CompletionItem, CompletionItemKind, TextDocumentPositionParams } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { CST, parseDocument } from 'yaml';
import { Node, Pair, Scalar } from 'yaml/types';
import { Type, YAMLError } from 'yaml/util';
import { SimpleYamlKey, SimpleYamlNode, SimpleYamlType, SimpleYamlValue, YamlNode } from '../types';
import TextDocumentService from './TextDocumentService';
import moment from 'moment';

function inRange(node: Node | CST.Node, offset: number, ignoreRange = false): boolean {
  const cstNode = 'cstNode' in node ? node.cstNode : node;
  if (!cstNode || !cstNode.range || !('start' in cstNode.range)) return ignoreRange;

  const { start, end, origStart, origEnd } = cstNode.range;
  return offset >= (origStart || start) && offset <= (origEnd || end) + 1;
}

// TODO: Replace with param to constructor
//const roundingScheme = new BasicRoundingScheme();

export default class CompletionService extends TextDocumentService<TextDocument> {
  public doComplete(textDocumentPosition: TextDocumentPositionParams): CompletionItem[] {
    const { textDocument, position } = textDocumentPosition;

    const document = this.getDocument(textDocument.uri);
    if (!document) return [];

    const offset = document.offsetAt(position);
    const parsed = parseDocument(document?.getText(), { keepCstNodes: true, setOrigRanges: true });

    if (!parsed.contents) return [];
    const node = CompletionService.getNode(parsed.contents as YamlNode, offset);
    const error = CompletionService.getError(parsed.errors, offset);

    if (node) {
      if (node.type === SimpleYamlType.Key) return this.completeKey(node as SimpleYamlKey);
      if (node.type === SimpleYamlType.Value) return this.completeValue(node as SimpleYamlValue);
    }

    return [];
  }

  public getTimeCompletion() {
    const currentTime = moment();
    currentTime.seconds(0).milliseconds(0);

    const nearestTime = 0;
    return '10:00';
  }

  protected completeKey(node: SimpleYamlKey): CompletionItem[] {
    const { value, type } = node.node;

    const kind = CompletionItemKind.Property;
    const label = CompletionService.quote(`${node.context.join(' => ')}  | ${value}`, type);
    const data = 1;

    return [{ label, kind, data }];
  }

  protected completeValue(node: SimpleYamlValue): CompletionItem[] {
    const { value, type } = node.node;

    const kind = CompletionItemKind.Value;
    const label = CompletionService.quote(`${node.context.join(' => ')}  | ${value}`, type);
    const data = 1;

    return [{ label, kind, data }];
  }

  protected static quote(text: string, type?: Scalar.Type): string {
    switch (type) {
      case Type.QUOTE_DOUBLE:
        return `"${text}`;
      case Type.QUOTE_SINGLE:
        return `'${text}`;
      case Type.BLOCK_FOLDED:
      case Type.BLOCK_LITERAL:
      case Type.PLAIN:
      case undefined:
        return text;
    }
  }

  private static getError(errors: YAMLError[], offset: number): YAMLError | null {
    for (const error of errors) {
      if (error.source && inRange(error.source, offset)) return error;
    }

    return null;
  }

  private static getNode(node: YamlNode, offset: number, context: Scalar[] = []): SimpleYamlNode | null {
    switch (node.type) {
      case Type.MAP:
      case Type.FLOW_MAP:
      case Type.SEQ:
      case Type.FLOW_SEQ:
      case Type.DOCUMENT:
        for (const item of node.items) {
          if (inRange(item as YamlNode, offset, true)) {
            const node = this.getNode(item, offset, context);
            if (node) return node;
          }
        }
        return null;
      case Pair.Type.PAIR:
      case Pair.Type.MERGE_PAIR:
        const { key, value } = node;
        if (key && inRange(key, offset)) return { type: SimpleYamlType.Key, node: key as Scalar, context };
        return this.getNode(value, offset, [...context, key]);
      case Type.BLOCK_FOLDED:
      case Type.BLOCK_LITERAL:
      case Type.PLAIN:
      case Type.QUOTE_DOUBLE:
      case Type.QUOTE_SINGLE:
        if (inRange(node, offset)) return { type: SimpleYamlType.Value, node, context };
      case Type.ALIAS:
      default:
        return null;
    }
  }
}
