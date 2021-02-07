import moment from 'moment';
import {
  CompletionItem,
  CompletionItemKind,
  CompletionItemTag,
  InsertReplaceEdit,
  Position,
  TextEdit,
} from 'vscode-languageserver';
import { CST } from 'yaml';
import { Pair, Scalar, YAMLMap } from 'yaml/types';
import { Type } from 'yaml/util';
import {
  formatDate,
  formatDuration,
  formatTime,
  Path,
  StructuredLog,
  defaultBasicSettings,
  TaskTypeName,
} from '../../../shared/out';
import YamlParser from '../parse/YamlParser';
import { YamlKeyDescriptor, YamlNodeDescriptor, YamlSingleDescriptor, YamlType, YamlValueDescriptor } from '../types';
import TextDocumentService from './TextDocumentService';

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

  private static matchContext(
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

  public doComplete(position: Position): CompletionItem[] {
    if (!this.parser) return [];

    this.parser.invalidate();
    const node = this.parser.getNodeAt(position);

    switch (node?.type) {
      case YamlType.Key:
      case YamlType.EmptyKey:
        return this.completeKey(node as YamlKeyDescriptor, position);
      case YamlType.Value:
      case YamlType.EmptyValue:
        return this.completeValue(node as YamlValueDescriptor, position);
      case YamlType.Single:
        return this.completeSingle(node as YamlSingleDescriptor, position);
      case YamlType.None:
        return this.completeEmpty(node, position);
      default:
        return [];
    }
  }

  public resolveCompletion(completion: CompletionItem): CompletionItem {
    return completion;
  }

  protected addTextEdit(completions: CompletionItem[], position: Position, range?: CST.Range | null): CompletionItem[] {
    const offset = this.offsetAt(position);

    const [startOffset, endOffset] = [range?.origStart || range?.start, range?.origEnd || range?.end];

    if (startOffset !== undefined && endOffset !== undefined) {
      const [start, end] = [this.positionAt(startOffset), this.positionAt(endOffset)];
      const offsetPosition = this.positionAt(offset);

      const insertRange = { start, end: offsetPosition };
      const replaceRange = { start, end };

      for (const completion of completions) {
        const newText = completion.insertText || completion.label;
        completion.textEdit = InsertReplaceEdit.create(newText, insertRange, replaceRange);
      }
    }

    return completions;
  }

  protected alterInsertReplaceEdit(edit: TextEdit | InsertReplaceEdit, newText: string) {
    const prefixLength = edit.newText.indexOf(newText);
    const postfixLength = newText.length - edit.newText.length - prefixLength;
    if ('range' in edit) {
      const { range } = edit;
      return {
        newText,
        range: {
          start: { line: range.start.line, character: range.start.character - prefixLength },
          end: range.end,
        },
      };
    } else {
      const { insert, replace } = edit;

      return InsertReplaceEdit.create(
        newText,
        {
          start: { line: insert.start.line, character: insert.start.character - prefixLength },
          end: insert.end,
        },
        {
          start: { line: insert.start.line, character: insert.start.character - prefixLength },
          end: { line: insert.end.line, character: insert.end.character + postfixLength },
        }
      );
    }
  }

  protected completeEmpty(_node: YamlNodeDescriptor, position: Position): CompletionItem[] {
    const { context } = _node;
    const defaultPairKeys: (keyof StructuredLog)[] = ['date'];
    const defaultKeys: (keyof StructuredLog)[] = ['plannedTasks', 'timeLog'];
    const kind = CompletionItemKind.Property;

    if (
      CompletionService.matchContext(['timeLog'], context) ||
      CompletionService.matchContext(['plannedTasks'], context)
    )
      return this.completeKey(_node as YamlKeyDescriptor, position);
    else if (context.length == 0 && position.character == 0) {
      return [
        ...defaultPairKeys.map((label) => ({ kind, label })),
        ...this.postfixCompletions(
          defaultKeys.map((label) => ({ kind, label })),
          ':\n  '
        ),
      ];
    }

    return [];
  }

  protected completeKey({ node, context }: YamlKeyDescriptor, position: Position): CompletionItem[] {
    let completions: CompletionItem[] = [];

    if (CompletionService.matchContext(['timeLog'], context))
      completions = this.getTimeCompletion(position, Type.QUOTE_DOUBLE);
    if (CompletionService.matchContext(['plannedTasks'], context))
      completions = this.getPlannedTaskCompletion(position);

    return this.addTextEdit(completions, position, node?.cstNode?.range);
  }

  protected completeSingle(node: YamlSingleDescriptor, position: Position): CompletionItem[] {
    const { context } = node;
    if (
      CompletionService.matchContext(['plannedTasks'], context) ||
      CompletionService.matchContext(['timeLog'], context)
    )
      return this.completeKey(node, position);

    return [];
  }

  protected completeValue({ node, context }: YamlValueDescriptor, position: Position): CompletionItem[] {
    let completions: CompletionItem[] = [];
    if (CompletionService.matchContext(['date'], context)) completions = this.getDateCompletion(position);
    else if (CompletionService.matchContext(['timeLog', '*'], context)) {
      if (/\!b?r?e?a?k?/.test(node?.tag || '')) completions = this.getTimelogBreakCompletion(position);
      if (/\!b?e?g?i?n?/.test(node?.tag || '')) completions.push(...this.getTimelogBeginCompletion(position));
      if (!completions.length) completions = this.getTimelogTaskCompletion(position);
    } else if (CompletionService.matchContext(['plannedTasks', '*'], context)) {
      if (/\!b?r?e?a?k?/.test(node?.tag || '')) completions = this.getBreakDurationCompletion(position);
      else completions = this.getDurationCompletion(position);
    }

    return this.addTextEdit(completions, position, node?.cstNode?.range);
  }

  protected getBreakDurationCompletion(position: Position, quote?: Scalar.Type): CompletionItem[] {
    return this.prefixCompletions(this.getDurationCompletion(position, quote), '!break ', true);
  }

  protected getDateCompletion(position: Position, quote?: Scalar.Type): CompletionItem[] {
    const date = formatDate(moment(), this.currentConfiguration);
    return [
      {
        kind: CompletionItemKind.Unit,
        label: date,
        insertText: CompletionService.quote(date, quote),
      },
    ];
  }

  protected getDurationCompletion(position: Position, quote?: Scalar.Type): CompletionItem[] {
    const precision = this.currentConfiguration?.durationPrecision || defaultBasicSettings.durationPrecision;
    const end = (this.currentConfiguration?.workDayHours || defaultBasicSettings.workDayHours) * 60;

    const items: CompletionItem[] = [];
    for (let duration = precision; duration < end; duration += precision) {
      const label = formatDuration(duration, this.currentConfiguration);
      const text = CompletionService.quote(label, quote);
      items.push({
        kind: CompletionItemKind.Unit,
        label,
        filterText: text,
        insertText: text,
      });
    }

    return items;
  }

  protected getPlannedTaskCompletion(position: Position, quote?: Scalar.Type): CompletionItem[] {
    const kind = CompletionItemKind.Value;
    const planned = this.getPlannedTasksUntil(position);
    const commonTasks = [...(this.currentConfiguration?.commonTasks || defaultBasicSettings.commonTasks)];
    const commonBreaks = [...(this.currentConfiguration?.commonBreaks || defaultBasicSettings.commonBreaks)];

    const items: CompletionItem[] = [];
    for (const task of commonTasks) {
      const text = CompletionService.quote(task, quote);
      if (planned.indexOf(task) < 0) items.push({ kind, label: task, filterText: text, insertText: text });
    }

    const breakItems: CompletionItem[] = [];
    for (const task of commonBreaks) {
      const text = CompletionService.quote(task, quote);
      if (planned.indexOf(task) < 0)
        breakItems.push({
          kind,
          label: task,
          filterText: text,
          insertText: text,
          tags: [CompletionItemTag.Deprecated],
        });
    }

    return [...items, ...this.postfixCompletions(breakItems, ': !break')];
  }

  protected getPlannedTasksUntil(position: Position, type?: TaskTypeName): string[] {
    if (!this.parser) return [];

    const previousLogs = this.parser.getListNodesBefore(position, ['plannedTasks']);
    const tasks: (string | null)[] = previousLogs.map((log) => {
      const isBreak = YamlParser.containsNodeWithTag(log, '!break');
      if ((type == 'task' && isBreak) || (type == 'task' && !isBreak)) return null;
      const prefix = isBreak ? '!break ' : '';

      if (YamlParser.isScalar(log)) return `${prefix}${log.toString()}`;
      else if ((log.type == Pair.Type.PAIR || log.type == Pair.Type.MERGE_PAIR) && log.key)
        return `${prefix}${log.key.toString()}`;
      else if (log.type == Type.MAP || log.type == Type.FLOW_MAP)
        return `${prefix}${YamlParser.getFirstKey(log as YAMLMap)}`;
      else return null;
    });

    return tasks.filter((task) => !!task) as string[];
  }

  protected getQuoteOffset(type?: Scalar.Type): number {
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

  protected getTimeCompletion(position: Position, quote?: Scalar.Type): CompletionItem[] {
    const { durationPrecision, workHoursStart } = this.currentConfiguration || defaultBasicSettings;
    const currentTime = moment().seconds(0).milliseconds(0);
    const lastTime =
      this.getTimeLogUntil(position).pop()?.add(durationPrecision, 'm') || moment(workHoursStart, 'HH:mm');
    const age = currentTime.diff(lastTime, 'm');

    const items: CompletionItem[] = [];
    for (let i = 0; i < (24 * 60) / durationPrecision; i++) {
      items.push(this.getTimeCompletionItem(lastTime, i * durationPrecision, quote));
      lastTime.add(durationPrecision, 'm');
    }

    items.push(this.getTimeCompletionItem(currentTime, age, quote, true));

    return items;
  }

  protected getTimeCompletionItem(
    time: moment.Moment,
    diffMinutes: number,
    quote?: Scalar.Type,
    preselect?: boolean
  ): CompletionItem {
    const label = formatTime(time, this.currentConfiguration);
    const text = CompletionService.quote(label, quote);
    return {
      kind: CompletionItemKind.Unit,
      label,
      data: diffMinutes,
      filterText: text,
      detail: formatDuration(diffMinutes, this.currentConfiguration),
      sortText: diffMinutes.toFixed(0).padStart(9),
      insertText: text,
      preselect,
    };
  }

  protected getTimeLogUntil(position: Position): moment.Moment[] {
    if (!this.parser) return [];

    const previousLogs = this.parser.getListNodesBefore(position, ['timeLog']);
    const times: (string | null)[] = previousLogs.map((log) => {
      if (YamlParser.isScalar(log)) return log.toString();
      else if (log.type == Pair.Type.PAIR || log.type == Pair.Type.MERGE_PAIR)
        return log.key ? log.key.toString() : null;
      else if (log.type == Type.MAP || log.type == Type.FLOW_MAP) return YamlParser.getFirstKey(log as YAMLMap);
    });

    return times
      .map((time) => moment(time, this.currentConfiguration?.timeFormat || defaultBasicSettings.timeFormat))
      .filter((time) => time.isValid());
  }

  protected getTimelogBeginCompletion(position: Position, quote?: Scalar.Type, preselect = false): CompletionItem[] {
    const message = this.currentConfiguration?.beginDayMessage || defaultBasicSettings.beginDayMessage;
    const label = `!begin ${message}`;
    const text = `!begin ${CompletionService.quote(message, quote)}`;

    return [
      {
        kind: CompletionItemKind.Value,
        label,
        filterText: text,
        insertText: text,
        preselect: preselect,
      },
    ];
  }

  protected getTimelogBreakCompletion(position: Position, quote?: Scalar.Type): CompletionItem[] {
    const kind = CompletionItemKind.Value;
    const planned = this.getPlannedTasksUntil(position, 'break');
    for (const task of this.currentConfiguration?.commonBreaks || defaultBasicSettings.commonBreaks) {
      if (planned.indexOf(task) < 0) planned.push(task);
    }

    let priority = 0;
    const items: CompletionItem[] = [];
    for (const task of planned) {
      const label = `!break ${task}`;
      const text = `!break ${CompletionService.quote(task, quote)}`;
      items.push({
        kind,
        label,
        filterText: text,
        insertText: text,
        tags: [CompletionItemTag.Deprecated],
        sortText: (priority++).toString().padStart(9),
      });
    }

    return items;
  }

  protected getTimelogTaskCompletion(position: Position, quote?: Scalar.Type): CompletionItem[] {
    const kind = CompletionItemKind.Value;
    const planned = this.getPlannedTasksUntil(position);
    const firstTask = this.getTimeLogUntil(position).length <= 1;
    const commonTasks = [...(this.currentConfiguration?.commonTasks || defaultBasicSettings.commonTasks)];
    const commonBreaks = [...(this.currentConfiguration?.commonBreaks || defaultBasicSettings.commonBreaks)];
    for (const task of commonTasks) if (planned.indexOf(task) < 0) planned.push(task);
    for (const task of commonBreaks) if (planned.indexOf(task) < 0) planned.push(`!break ${task}`);

    let priority = 0;
    const items: CompletionItem[] = [];
    if (firstTask) items.push(...this.getTimelogBeginCompletion(position, quote, true));
    for (const task of planned) {
      const text = CompletionService.quote(task, quote);
      items.push({
        kind,
        label: task,
        filterText: text,
        insertText: text,
        tags: /^\!break /.test(task) ? [CompletionItemTag.Deprecated] : [],
        sortText: (priority++).toString().padStart(9),
      });
    }

    return items;
  }

  protected postfixCompletions(completions: CompletionItem[], postfix: string, changeLabels = false): CompletionItem[] {
    return completions.map((completion) => {
      const altered = { ...completion };
      altered.label = changeLabels ? `${completion.label}${postfix}` : completion.label;
      altered.insertText = completion.insertText
        ? `${completion.insertText}${postfix}`
        : `${completion.label}${postfix}`;
      altered.textEdit = altered.textEdit
        ? this.alterInsertReplaceEdit(altered.textEdit, `${altered.textEdit}${postfix}`)
        : altered.textEdit;

      return altered;
    });
  }

  protected prefixCompletions(completions: CompletionItem[], prefix: string, changeLabels = false): CompletionItem[] {
    return completions.map((completion) => {
      const altered = { ...completion };
      altered.label = changeLabels ? `${prefix}${completion.label}` : completion.label;
      altered.insertText = completion.insertText ? `${prefix}${completion.insertText}` : `${prefix}${completion.label}`;
      altered.filterText = completion.filterText ? `${prefix}${completion.filterText}` : undefined;
      altered.textEdit = altered.textEdit
        ? this.alterInsertReplaceEdit(altered.textEdit, `${prefix}${altered.textEdit}`)
        : altered.textEdit;

      return altered;
    });
  }

  protected prepostfixCompletions(
    completions: CompletionItem[],
    prefix: string,
    postfix: string,
    changeLabels = false
  ): CompletionItem[] {
    const prefixed = this.prefixCompletions(completions, prefix, changeLabels);
    return this.postfixCompletions(prefixed, postfix, changeLabels);
  }
}
