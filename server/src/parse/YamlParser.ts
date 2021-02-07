import { Position } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { CST, defaultOptions, Document, parseDocument } from 'yaml';
import { Scalar, Pair, Collection, Node, YAMLMap } from 'yaml/types';
import { YAMLError, Type } from 'yaml/util';
import { YamlNode, YamlNodeDescriptor, YamlType } from '../types';
import { yamlCustomTags } from '../../../shared/out';

defaultOptions.customTags = yamlCustomTags;

export default class YamlParser {
  private readonly document: TextDocument;

  private _parsed?: Document.Parsed;
  private _text?: string;

  public constructor(document: TextDocument) {
    this.document = document;
  }

  public get errors(): YAMLError[] {
    return this.parsed.errors;
  }

  public get rootnode(): YamlNode | null {
    return this.parsed.contents as YamlNode;
  }

  public get text(): string {
    if (this._text !== undefined) return this._text;
    else return (this._text = this.document.getText());
  }

  protected get parsed(): Document.Parsed {
    if (this._parsed !== undefined) return this._parsed;
    return this.parseDocument();
  }

  public static containsNodeWithTag(node: YamlNode, tag: string | string[], maxDepth = Infinity): boolean {
    if (maxDepth == 0) return false;

    if (YamlParser.isScalar(node)) {
      return typeof tag == 'string' ? node.tag == tag : tag.includes(node.tag || '');
    } else if (node && 'items' in node) {
      for (const item of node.items) if (YamlParser.containsNodeWithTag(item, tag, maxDepth--)) return true;
    } else if (node && 'value' in node) return YamlParser.containsNodeWithTag(node.value, tag, maxDepth--);

    return false;
  }

  public static getFirstKey(map: YAMLMap): string | null {
    if (!map.items.length) return null;
    return map.items[0].key.toString();
  }

  public static isScalar(node: YamlNode | null): node is Scalar {
    if (!node) return false;
    const { type } = node;
    return (
      type == Type.PLAIN ||
      type == Type.QUOTE_SINGLE ||
      type == Type.QUOTE_DOUBLE ||
      type == Type.BLOCK_FOLDED ||
      type == Type.BLOCK_LITERAL
    );
  }

  public getError(errors: YAMLError[], offset: number): YAMLError | null {
    for (const error of errors) {
      if (error.source && this.isInRange(error.source, offset)) return error;
    }

    return null;
  }

  public getListNodesBefore(position: Position, targetContext: string[]): YamlNode[] {
    const list: YamlNode = this.parsed.getIn(targetContext);
    const before: YamlNode[] = [];

    if (list.type == Type.SEQ && list.items[0]) {
      for (const item of list.items) {
        if (item && this.isBefore(position, item)) before.push(item);
        else return before;
      }
    }

    return before;
  }

  public getNodeAt(offset: number, node?: YamlNode | null, context?: (Scalar | null)[]): YamlNodeDescriptor;
  public getNodeAt(position: Position, node?: YamlNode | null, context?: (Scalar | null)[]): YamlNodeDescriptor;
  public getNodeAt(
    _offset: Position | number,
    node: YamlNode | null = this.rootnode,
    context: (Scalar | null)[] = []
  ): YamlNodeDescriptor {
    const offset = typeof _offset == 'number' ? _offset : this.document.offsetAt(_offset);
    if (!node) return { type: YamlType.None, node, context };

    switch (node.type) {
      case Type.MAP:
      case Type.FLOW_MAP:
      case Type.SEQ:
      case Type.FLOW_SEQ:
      case Type.DOCUMENT:
        return this.getNodeFromCollection(node, offset, context);
      case Pair.Type.PAIR:
      case Pair.Type.MERGE_PAIR:
        return this.getNodeFromPair(node, offset, context);
      case Type.BLOCK_FOLDED:
      case Type.BLOCK_LITERAL:
      case Type.PLAIN:
      case Type.QUOTE_DOUBLE:
      case Type.QUOTE_SINGLE:
        if (this.isInRange(node, offset)) return { type: YamlType.Value, node, context };
      case Type.ALIAS:
      default:
        return { type: YamlType.None, context };
    }
  }

  public getNodeIn(context: string[]): YamlNode {
    return this.parsed.getIn(context, true);
  }

  public hasDocument(document?: TextDocument): boolean {
    return document == this.document;
  }

  public invalidate() {
    this._text = undefined;
    this._parsed = undefined;
  }

  private getIndent(position: Position, indentSpaces = 2): number {
    const line = this.document.getText({
      start: { line: position.line, character: 0 },
      end: position,
    });
    let indent = 0;
    while (line && indent < line.length && line[indent].match(/\s/)) indent++;

    return Math.floor(indent / indentSpaces);
  }

  private getNodeFromCollection(node: Collection, offset: number, context: (Scalar | null)[] = []): YamlNodeDescriptor {
    const offsetPosition = this.document.positionAt(offset);
    const nodePosition = this.document.positionAt(node.cstNode?.range?.origStart || node.cstNode?.range?.start || 0);
    let lineOffset = 0;
    for (const item of node.items as YamlNode[]) {
      if (!item && nodePosition.line + lineOffset == offsetPosition.line)
        return { type: YamlType.Single, node: item, context };
      if (YamlParser.isScalar(item) && this.isInRange(item, offset))
        return { type: YamlType.Single, node: item, context };
      const inner = item ? this.getNodeAt(offset, item, context) : null;
      if (inner && inner.type !== YamlType.None) return inner;

      if (item && item.cstNode && item.cstNode.range) {
        const { start, end, origStart, origEnd } = item.cstNode.range;
        const startLine = this.document.positionAt(origStart || start).line;
        const endLine = this.document.positionAt(origEnd || end).line;
        lineOffset += endLine - startLine;
      }
    }

    return { type: YamlType.None, context };
  }

  private getNodeFromPair(node: Pair, offset: number, context: (Scalar | null)[] = []): YamlNodeDescriptor {
    const { key, value }: { key: Scalar | null; value: YamlNode | null } = node;
    let lineOffset = key?.cstNode?.range?.origEnd || key?.cstNode?.range?.end;
    if (lineOffset == undefined) lineOffset = value?.cstNode?.range?.origEnd || value?.cstNode?.range?.end;

    if (key && this.isInRange(key, offset)) return { type: YamlType.Key, node: key as Scalar, context };
    if (value && this.isInRange(value, offset)) {
      if (YamlParser.isScalar(value)) return { type: YamlType.Value, node: value, context: [...context, key] };
      return this.getNodeAt(offset, value, [...context, key]);
    }

    const offsetPosition = this.document.positionAt(offset);
    const pairPosition = lineOffset !== undefined ? this.document.positionAt(lineOffset) : undefined;
    if (pairPosition !== undefined && offsetPosition.line == pairPosition.line) {
      return key ? { type: YamlType.EmptyValue, context: [...context, key] } : { type: YamlType.EmptyKey, context };
    }
    if (
      pairPosition !== undefined &&
      offsetPosition.line == pairPosition.line + 1 &&
      this.getIndent(offsetPosition) > this.getIndent(pairPosition)
    ) {
      return key ? { type: YamlType.EmptyKey, context: [...context, key] } : { type: YamlType.None, context };
    }
    return { type: YamlType.None, context };
  }

  private isBefore(offset: number, node: Node | CST.Node): boolean;
  private isBefore(position: Position, node: Node | CST.Node): boolean;
  private isBefore(_offset: number | Position, node: Node | CST.Node): boolean {
    const offset = typeof _offset == 'number' ? _offset : this.document.offsetAt(_offset);
    const cstNode = 'cstNode' in node ? node.cstNode : node;
    if (!cstNode || !cstNode.range || !('start' in cstNode.range)) return false;

    const { start, origStart } = cstNode.range;
    return offset > (origStart || start);
  }

  private isInRange(node: Node | CST.Node, offset: number, ignoreRange?: boolean): boolean;
  private isInRange(node: Node | CST.Node, position: Position, ignoreRange?: boolean): boolean;
  private isInRange(node: Node | CST.Node, _offset: number | Position, ignoreRange = false): boolean {
    const offset = typeof _offset == 'number' ? _offset : this.document.offsetAt(_offset);
    const cstNode = 'cstNode' in node ? node.cstNode : node;
    if (!cstNode || !cstNode.range || !('start' in cstNode.range)) return ignoreRange;

    const { start, end, origStart, origEnd } = cstNode.range;
    return offset >= (origStart || start) && offset <= (origEnd || end) + 1;
  }

  private parseDocument(): Document.Parsed {
    this._parsed = parseDocument(this.text, { keepCstNodes: true, setOrigRanges: true });
    return this._parsed;
  }
}
