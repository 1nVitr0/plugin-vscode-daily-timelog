import moment from 'moment';
import { CompletionItem, CompletionItemKind, InsertReplaceEdit, Position, TextEdit } from 'vscode-languageserver';
import { CST, parseDocument } from 'yaml';
import { Collection, Node, Pair, Scalar } from 'yaml/types';
import { Type, YAMLError } from 'yaml/util';
import { defaultBasicSettings, formatDuration, formatTime } from '../../../shared/out';
import {
  YamlKeyDEscriptor as YamlKeyDescriptor,
  YamlNodeDescriptor,
  YamlType as YamlType,
  YamlValueDescriptor as YamlValue,
  YamlNode,
} from '../types';
import TextDocumentService from './TextDocumentService';

function inRange(node: Node | CST.Node, offset: number, ignoreRange = false): boolean {
  const cstNode = 'cstNode' in node ? node.cstNode : node;
  if (!cstNode || !cstNode.range || !('start' in cstNode.range)) return ignoreRange;

  const { start, end, origStart, origEnd } = cstNode.range;
  return offset >= (origStart || start) && offset <= (origEnd || end) + 1;
}

// TODO: Replace with param to constructor
//const roundingScheme = new BasicRoundingScheme();

export default class CompletionService extends TextDocumentService {
  protected static quote(text: string, type?: Scalar.Type, keepEndQuote = true): string {
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

  protected static quoteOffset(type?: Scalar.Type): number {
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

  public doComplete(position: Position): CompletionItem[] {
    if (!this.currentDocument) return [];

    const offset = this.offsetAt(position);
    const parsed = parseDocument(this.currentDocument?.getText(), { keepCstNodes: true, setOrigRanges: true });

    if (!parsed.contents) return [];
    const node = this.getNode(parsed.contents as YamlNode, offset + 1);
    const error = this.getError(parsed.errors, offset + 1);

    switch (node?.type) {
      case YamlType.Key:
      case YamlType.EmptyKey:
        return this.completeKey(node as YamlKeyDescriptor, position);
      case YamlType.Value:
      case YamlType.EmptyValue:
        return this.completeValue(node as YamlValue, position);
      case YamlType.None:
        return this.getDurationCompletion();
      default:
        return [];
    }
  }

  public getDurationCompletion(): CompletionItem[] {
    const start = 15;
    const end = 8 * 60;

    const items: CompletionItem[] = [];
    for (let duration = start; duration < end; duration += 15) {
      items.push({
        kind: CompletionItemKind.Unit,
        label: ` ${formatDuration(duration, defaultBasicSettings)}`,
        data: duration,
      });
    }

    return items;
  }

  public getTimeCompletion(node: Scalar, position: Position): CompletionItem[] {
    const kind = CompletionItemKind.Property;
    const currentTime = moment();
    currentTime.seconds(0).milliseconds(0);

    const items: CompletionItem[] = [];
    const nearestTime = moment();
    for (let i = 0; i < 10; i++) {
      nearestTime.add(15, 'm');
      const label = formatTime(nearestTime);
      const text = CompletionService.quote(label, node.type, false);
      items.push({
        kind,
        label,
        filterText: text,
        data: i,
        textEdit: this.getTextEdit(text, position, node),
      });
    }

    return items;
  }

  protected completeKey(node: YamlKeyDescriptor, position: Position): CompletionItem[] {
    const kind = CompletionItemKind.Property;

    if (!node.node) return [{ kind, label: `${node.context.join(' => ')}` }];

    const { value, type, cstNode } = node.node;

    if (type == Type.QUOTE_SINGLE) return this.getTimeCompletion(node.node, position);
    const label = CompletionService.quote(`${node.context.join(' => ')}  | ${value}`, type);
    const data = 1;

    return [{ label, kind, data }];
  }

  protected completeValue(node: YamlValue, position: Position): CompletionItem[] {
    const kind = CompletionItemKind.Value;
    if (!node.node) return [...this.getDurationCompletion(), { kind, label: `${node.context.join(' => ')}` }];

    const { value, type } = node.node;

    const label = CompletionService.quote(`${node.context.join(' => ')}  | ${value}`, type);
    const data = 1;

    return [...this.getDurationCompletion(), { label, kind, data }];
  }

  protected getTextEdit(
    newText: string,
    position: Position,
    originalNode: Scalar
  ): InsertReplaceEdit | TextEdit | undefined {
    const range = originalNode.cstNode?.range;
    const offset = this.offsetAt(position);

    const startOffset = range?.origStart || range?.start;
    const endOffset = range?.origEnd || range?.end;
    const quoteOffset = originalNode.type == Type.QUOTE_SINGLE || originalNode.type == Type.QUOTE_DOUBLE ? 1 : 0;

    if (startOffset !== undefined && endOffset !== undefined) {
      const start = this.positionAt(startOffset);
      const end = this.positionAt(endOffset - quoteOffset);
      const offsetPosition = this.positionAt(offset);

      const insertRange = { start, end: offsetPosition };
      const replaceRange = { start, end };

      return InsertReplaceEdit.create(newText, insertRange, replaceRange);
    }
  }

  private getError(errors: YAMLError[], offset: number): YAMLError | null {
    for (const error of errors) {
      if (error.source && inRange(error.source, offset)) return error;
    }

    return null;
  }

  private getNode(node: YamlNode, offset: number, context: (Scalar | null)[] = []): YamlNodeDescriptor {
    switch (node.type) {
      case (Type.MAP, Type.FLOW_MAP, Type.SEQ, Type.FLOW_SEQ, Type.DOCUMENT):
        return this, this.getNodeFromCollection(node, offset, context);
      case (Pair.Type.PAIR, Pair.Type.MERGE_PAIR):
        return this.getNodeFromPair(node, offset, context);
      case (Type.BLOCK_FOLDED, Type.BLOCK_LITERAL, Type.PLAIN, Type.QUOTE_DOUBLE, Type.QUOTE_SINGLE):
        if (inRange(node, offset)) return { type: YamlType.Value, node, context };
      case Type.ALIAS:
      default:
        return { type: YamlType.None, context };
    }
  }

  private getNodeFromCollection(node: Collection, offset: number, context: (Scalar | null)[] = []): YamlNodeDescriptor {
    for (const item of node.items) {
      const inner = this.getNode(item, offset, context);
      if (inner.type !== YamlType.None) return inner;
    }
    return { type: YamlType.None, context };
  }

  private getNodeFromPair(node: Pair, offset: number, context: (Scalar | null)[] = []): YamlNodeDescriptor {
    const { key, value }: { key: Scalar | null; value: YamlNode | null } = node;
    const lineOffset = key?.cstNode?.range?.origEnd || value?.cstNode?.range?.origEnd;

    if (key && inRange(key, offset)) return { type: YamlType.Key, node: key as Scalar, context };
    if (value && inRange(value, offset)) return this.getNode(value, offset, [...context, key]);
    if (lineOffset !== undefined && this.positionAt(offset).line == this.positionAt(lineOffset).line) {
      return key ? { type: YamlType.EmptyValue, context: [...context, key] } : { type: YamlType.EmptyKey, context };
    }
    return { type: YamlType.None, context };
  }
}
