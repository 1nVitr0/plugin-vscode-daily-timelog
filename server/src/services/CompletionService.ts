import { last } from 'lodash';
import moment from 'moment';
import {
  CompletionItem,
  CompletionItemKind,
  CompletionItemTag,
  InsertReplaceEdit,
  Position,
} from 'vscode-languageserver';
import { CST } from 'yaml';
import { Pair, Scalar, YAMLMap } from 'yaml/types';
import { Type } from 'yaml/util';
import {
  defaultBasicSettings,
  formatDate,
  formatDuration,
  formatTime,
  ParamType,
  parseDuration,
  TaskTypeName,
  ParamLocation,
  CustomParams,
  formatString,
  Task,
} from '../../../shared/out';
import YamlParser from '../parse/YamlParser';
import { YamlKeyDescriptor, YamlNodeDescriptor, YamlSingleDescriptor, YamlType, YamlValueDescriptor } from '../types';
import { addQuotes, matchContext, postfixCompletions, prefixCompletions } from './completion/completionModification';
import TextDocumentService from './TextDocumentService';

export default class CompletionService extends TextDocumentService {
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
    // TODO: Enrich with more information
    return completion;
  }

  protected addTextEdit(
    completions: CompletionItem[],
    position: Position,
    range?: CST.Range | null,
    hasQuote = false
  ): CompletionItem[] {
    const [startOffset, endOffset] = [range?.origStart || range?.start, range?.origEnd || range?.end];

    if (startOffset == undefined || endOffset == undefined) return completions;

    const quoteOffset = hasQuote ? 1 : 0;
    const [start, end] = [this.positionAt(startOffset - quoteOffset), this.positionAt(endOffset + quoteOffset)];
    const insertRange = { start, end: position };
    const replaceRange = { start, end };

    for (const completion of completions) {
      const newText = completion.insertText || completion.label;
      completion.textEdit = InsertReplaceEdit.create(newText, insertRange, replaceRange);
    }

    return completions;
  }

  protected completeEmpty(_node: YamlNodeDescriptor, position: Position): CompletionItem[] {
    const { context } = _node;
    const defaultPairKeys: string[] = ['date'];
    const defaultKeys: string[] = ['plannedTasks', 'timeLog'];
    const kind = CompletionItemKind.Property;

    for (const param of this.currentConfiguration?.customParams || []) {
      if (param.type == ParamType.Array) defaultKeys.push(param.name);
      else defaultPairKeys.push(param.name);
    }

    if (matchContext(['timeLog'], context) || matchContext(['plannedTasks'], context))
      return this.completeKey(_node as YamlKeyDescriptor, position);
    else if (context.length == 0) {
      return [
        ...postfixCompletions(
          defaultPairKeys.map((label) => ({ kind, label })),
          ':'
        ),
        ...postfixCompletions(
          defaultKeys.map((label) => ({ kind, label })),
          ':\n  '
        ),
      ];
    }

    return [];
  }

  protected completeKey(descriptor: YamlKeyDescriptor, position: Position): CompletionItem[] {
    const { node, context } = descriptor;
    let completions: CompletionItem[] = [];

    if (matchContext(['plannedTasks'], context)) completions = this.getPlannedTaskParamsCompletion(position);
    else if (matchContext(['timeLog'], context)) completions = this.getTimeLogParamsCompletion(position);
    else completions = this.completeEmpty(descriptor, position);

    return this.addTextEdit(completions, position, node?.cstNode?.range, YamlParser.isQuoted(node));
  }

  protected completeSingle({ node, context }: YamlSingleDescriptor, position: Position): CompletionItem[] {
    let completions: CompletionItem[] = [];

    if (matchContext(['plannedTasks'], context)) completions = this.getPlannedTaskCompletion(position);
    else if (matchContext(['timeLog'], context)) completions = this.getTimeCompletion(position, Type.QUOTE_DOUBLE);
    else if (matchContext(['plannedTasks', '*'], context) || matchContext(['timeLog', '*'], context))
      completions = this.getCustomTaskParamValueCompletion(context) || [];
    else completions = this.getCustomParamValueCompletion(context) || [];

    return this.addTextEdit(completions, position, node?.cstNode?.range, YamlParser.isQuoted(node));
  }

  protected completeValue(_node: YamlValueDescriptor, position: Position): CompletionItem[] {
    const { node, context } = _node;

    let completions: CompletionItem[] = [];
    if (matchContext(['date'], context)) completions = this.getDateCompletion(position);
    else if (matchContext(['timeLog', '*'], context)) completions = this.getTimeLogValueCompletion(position, _node);
    else if (matchContext(['plannedTasks', '*'], context))
      completions = this.getPlannedTasksValueCompletion(position, _node);

    return this.addTextEdit(completions, position, node?.cstNode?.range, YamlParser.isQuoted(node));
  }

  protected getBreakDurationCompletion(position: Position, quote?: Scalar.Type): CompletionItem[] {
    return prefixCompletions(this.getDurationCompletion(position, quote), '!break ', true);
  }

  protected getDateCompletion(position: Position, quote?: Scalar.Type): CompletionItem[] {
    const date = formatDate(moment(), this.currentConfiguration);
    return [
      {
        kind: CompletionItemKind.Unit,
        label: date,
        insertText: addQuotes(date, quote),
      },
    ];
  }

  protected getDurationCompletion(position: Position, quote?: Scalar.Type): CompletionItem[] {
    const precision = this.currentConfiguration?.durationPrecision || defaultBasicSettings.durationPrecision;
    const end = (this.currentConfiguration?.workDayHours || defaultBasicSettings.workDayHours) * 60;
    const currentTotal = this.getDurationsExcept(
      position,
      this.currentConfiguration?.includeBreaksInTotal ? undefined : 'task'
    ).reduce((sum, dur) => sum.add(dur), moment.duration(0));

    const items: CompletionItem[] = [];
    for (let duration = precision; duration < end; duration += precision) {
      const label = formatDuration(duration, this.currentConfiguration);
      const detail = `Total: ${formatDuration(currentTotal.clone().add(duration, 'm'), this.currentConfiguration)}`;
      const text = addQuotes(label, quote);
      items.push({
        kind: CompletionItemKind.Unit,
        label,
        detail,
        sortText: duration.toString().padStart(9, '0'),
        filterText: text,
        insertText: text,
      });
    }

    return items;
  }

  protected getDurationsExcept(position: Position, type?: TaskTypeName): moment.Duration[] {
    if (!this.parser) return [];

    const otherDurations = this.parser.getListNodesExcept(position, ['plannedTasks']);
    const durations: (moment.Duration | null)[] = otherDurations.map((log) => {
      const isBreak = YamlParser.containsNodeWithTag(log, '!break');
      if ((type == 'task' && isBreak) || (type == 'break' && !isBreak)) return null;

      if (YamlParser.isScalar(log)) return parseDuration(log.toString(), this.currentConfiguration);
      else if ((log.type == Pair.Type.PAIR || log.type == Pair.Type.MERGE_PAIR) && log.value)
        return parseDuration(log.value.toString(), this.currentConfiguration);
      else if (log.type == Type.MAP || log.type == Type.FLOW_MAP) {
        const value = YamlParser.getFirstValue(log as YAMLMap);
        return value ? parseDuration(value, this.currentConfiguration) : null;
      } else return null;
    });

    return durations.filter((duration) => duration && duration.isValid()) as moment.Duration[];
  }

  protected getPlannedTaskCompletion(position: Position, quote?: Scalar.Type): CompletionItem[] {
    const kind = CompletionItemKind.Value;
    const planned = this.getPlannedTasksUntil(position);
    const commonTasks = [...(this.currentConfiguration?.commonTasks || defaultBasicSettings.commonTasks)];
    const commonBreaks = [...(this.currentConfiguration?.commonBreaks || defaultBasicSettings.commonBreaks)];

    const items: CompletionItem[] = [];
    for (const task of commonTasks) {
      const text = addQuotes(task, quote);
      if (planned.indexOf(task) < 0) items.push({ kind, label: task, filterText: text, insertText: text });
    }

    const breakItems: CompletionItem[] = [];
    for (const task of commonBreaks) {
      const text = addQuotes(task, quote);
      if (planned.indexOf(task) < 0)
        breakItems.push({
          kind,
          label: task,
          filterText: text,
          insertText: text,
          tags: [CompletionItemTag.Deprecated],
        });
    }

    return [...postfixCompletions(items, ':'), ...postfixCompletions(breakItems, ': !break')];
  }

  protected getPlannedTaskParamsCompletion(position: Position, quote?: Scalar.Type): CompletionItem[] {
    const params = ['group', 'description', 'comment', ...this.getCustomTaskParamNames(ParamLocation.PlannedTasks)];

    return params.map((param) => ({
      label: param,
      insertText: `${param}:`,
    }));
  }

  protected getPlannedTasksUntil(position: Position, type?: TaskTypeName): string[] {
    if (!this.parser) return [];

    const previousLogs = this.parser.getListNodesBefore(position, ['plannedTasks']);
    const tasks: (string | null)[] = previousLogs.map((log) => {
      const isBreak = YamlParser.containsNodeWithTag(log, '!break');
      if ((type == 'task' && isBreak) || (type == 'break' && !isBreak)) return null;
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

  protected getPlannedTasksValueCompletion(
    position: Position,
    { node, context }: YamlValueDescriptor,
    quote?: Scalar.Type
  ): CompletionItem[] {
    let completions: CompletionItem[] = [];
    const localContext = last(context)?.toString();

    switch (localContext) {
      case 'comment':
        return this.getCommentCompletion(position);
      case 'group':
        return this.getGroupCompletion(position);
      case 'description':
        return this.getDescriptionCompletion(position);
      default:
        const paramCompletions = this.getCustomTaskParamValueCompletion(context);
        if (paramCompletions) return paramCompletions;
    }

    if (/\!b?r?e?a?k?/.test(node?.tag || '')) completions = this.getBreakDurationCompletion(position);
    else completions = this.getDurationCompletion(position);

    return completions;
  }

  protected getCommentCompletion(position: Position, quote?: Scalar.Type): CompletionItem[] {
    return [];
  }

  protected getDescriptionCompletion(position: Position, quote?: Scalar.Type): CompletionItem[] {
    return [];
  }

  protected getGroupCompletion(position: Position, quote?: Scalar.Type): CompletionItem[] {
    return (this.currentConfiguration?.taskGroups || defaultBasicSettings.taskGroups).map((label) => ({
      label,
    }));
  }

  protected getTicketCompletion(position: Position, quote?: Scalar.Type): CompletionItem[] {
    return (this.currentConfiguration?.ticketPrefixes || defaultBasicSettings.ticketPrefixes).map((label) => ({
      label,
    }));
  }

  protected getProgressCompletion(position: Position, quote?: Scalar.Type): CompletionItem[] {
    const items: CompletionItem[] = [];
    for (let i = 10; i <= 100; i += 10) items.push({ label: `${i}%`, sortText: `${i}`.padStart(3, '0s') });

    return items;
  }

  protected getTimeCompletion(position: Position, quote?: Scalar.Type): CompletionItem[] {
    const { durationPrecision, workDayHoursStart: workHoursStart } = this.currentConfiguration || defaultBasicSettings;
    const currentTime = moment().seconds(0).milliseconds(0);
    const lastTime =
      this.getTimeLogUntil(position).pop()?.add(durationPrecision, 'm') || moment(workHoursStart, 'HH:mm');
    const nextTime = this.getNextTime(position);
    const age = currentTime.diff(lastTime, 'm');

    const items: CompletionItem[] = [];
    if (!nextTime || currentTime < nextTime) items.push(this.getTimeCompletionItem(currentTime, age, quote, true));
    if (!nextTime) items.push(this.getRunningTimeCompletionItem(quote));
    for (let i = 0; i < (24 * 60) / durationPrecision; i++) {
      items.push(this.getTimeCompletionItem(lastTime, (i + 1) * durationPrecision, quote));
      lastTime.add(durationPrecision, 'm');
      if (nextTime && lastTime >= nextTime) break;
    }

    return postfixCompletions(items, ':');
  }

  protected getTimeCompletionItem(
    time: moment.Moment,
    diffMinutes: number,
    quote?: Scalar.Type,
    preselect?: boolean
  ): CompletionItem {
    const label = formatTime(time, this.currentConfiguration);
    const text = addQuotes(label, quote);
    const sortIndex = Math.floor(24 * 60 + diffMinutes);
    return {
      kind: CompletionItemKind.Unit,
      label,
      data: diffMinutes,
      filterText: text,
      detail: formatDuration(diffMinutes, this.currentConfiguration),
      sortText: sortIndex.toString().padStart(9, '0'),
      insertText: text,
      preselect,
    };
  }

  protected getRunningTimeCompletionItem(quote?: Scalar.Type, preselect?: boolean): CompletionItem {
    const label = '~' + formatTime(moment(), this.currentConfiguration);
    const text = addQuotes(label, quote);
    return {
      kind: CompletionItemKind.Unit,
      label,
      data: 'Currently ongoing task',
      filterText: text,
      detail: 'ongoing...',
      insertText: text + ': !running',
      preselect,
    };
  }

  protected getTimeLogParamsCompletion(position: Position, quote?: Scalar.Type): CompletionItem[] {
    const params = ['comment', 'progress', ...this.getCustomTaskParamNames(ParamLocation.TimeLog)];

    return params.map((param) => ({
      label: param,
      insertText: `${param}:`,
    }));
  }

  protected getAllTasks(type?: TaskTypeName): string[] {
    if (!this.parser) return [];
    const position = Position.create(this.getLineCount() || Infinity, 0);

    const previousLogs = this.parser.getListNodesBefore(position, ['timeLog']);
    const logged: string[] = previousLogs
      .map((log) => {
        if (YamlParser.isScalar(log)) return log.toString();
        else if (log.type == Pair.Type.PAIR || log.type == Pair.Type.MERGE_PAIR)
          return log.value ? log.value.toString() : null;
        else if (log.type == Type.MAP || log.type == Type.FLOW_MAP) return YamlParser.getFirstValue(log as YAMLMap);
      })
      .filter((task) => !!task);
    const planned = this.getPlannedTasksUntil(position, type);

    const merged = logged.filter((task) => !/\[(begin|break|end)\]/.test(task));
    for (const task of planned) if (merged.indexOf(task) < 0) merged.push(task);

    return merged;
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

  protected getNextTime(position: Position): moment.Moment | null {
    if (!this.parser) return null;

    const after = this.parser.getListNodeAfter(position, ['timeLog']);
    if (!after) return null;

    const text: string | null = YamlParser.isScalar(after)
      ? after.toString()
      : after.type == Pair.Type.PAIR || after.type == Pair.Type.MERGE_PAIR
      ? after.key
        ? after.key.toString()
        : null
      : after.type == Type.MAP || after.type == Type.FLOW_MAP
      ? YamlParser.getFirstKey(after as YAMLMap)
      : null;

    const time = moment(text, this.currentConfiguration?.timeFormat || defaultBasicSettings.timeFormat);
    if (time.isValid()) return time;
    else return null;
  }

  protected getTimeLogValueCompletion(
    position: Position,
    { node, context }: YamlValueDescriptor,
    quote?: Scalar.Type
  ): CompletionItem[] {
    let completions: CompletionItem[] = [];
    const localContext = last(context)?.toString();

    switch (localContext) {
      case 'comment':
        return this.getCommentCompletion(position);
      case 'progress':
        return this.getProgressCompletion(position);
      default:
        const paramCompletions = this.getCustomTaskParamValueCompletion(context);
        if (paramCompletions) return paramCompletions;
    }

    if (/\!running/.test(node?.tag || ''))
      return prefixCompletions(this.getTimelogTaskCompletion(position), '!running ');
    if (/\!b?r?e?a?k?/.test(node?.tag || '')) completions = this.getTimelogBreakCompletion(position);
    if (/\!b?e?g?i?n?/.test(node?.tag || '')) completions.push(...this.getTimelogBeginCompletion(position));
    if (completions.length) return completions;

    return this.getTimelogTaskCompletion(position);
  }

  protected getTimelogBeginCompletion(position: Position, quote?: Scalar.Type, preselect = false): CompletionItem[] {
    const message = this.currentConfiguration?.beginDayMessage || defaultBasicSettings.beginDayMessage;
    const label = `!begin ${message}`;
    const text = `!begin ${addQuotes(message, quote)}`;

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
      const text = `!break ${addQuotes(task, quote)}`;
      items.push({
        kind,
        label,
        filterText: text,
        insertText: text,
        tags: [CompletionItemTag.Deprecated],
        sortText: (priority++).toString().padStart(9, '0'),
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
      const text = addQuotes(task, quote);
      items.push({
        kind,
        label: task,
        filterText: text,
        insertText: text,
        tags: /^\!break /.test(task) ? [CompletionItemTag.Deprecated] : [],
        sortText: (priority++).toString().padStart(9, '0'),
      });
    }

    return items;
  }

  protected getCustomParamValueCompletion(context: (Scalar | null)[]): CompletionItem[] | null {
    const localContext = last(context)?.toString();
    const param = this.currentConfiguration?.customParams.find(({ name }) => name == localContext);
    return param ? this.getCustomParamValueCompletionItems(param) : null;
  }

  protected getCustomTaskParamValueCompletion(context: (Scalar | null)[]): CompletionItem[] | null {
    const localContext = last(context)?.toString();
    const param = this.currentConfiguration?.customTaskParams.find(({ name }) => name == localContext);
    return param ? this.getCustomParamValueCompletionItems(param) : null;
  }

  protected getCustomParamValueCompletionItems(param: CustomParams): CompletionItem[] {
    const kind = CompletionItemKind.Value;
    const tasks: Partial<Task>[] = this.getAllTasks('task').map<Partial<Task>>((task) => ({ name: task }));
    const paramData = {};

    const completions: CompletionItem[] = [];
    for (const suggestion of param.suggestions || []) {
      if (/\{\{\s*task\./.test(suggestion)) {
        const f = formatString;
        for (const task of tasks) completions.push({ kind, label: formatString(suggestion, { ...paramData, task }) });
      } else {
        completions.push({ kind, label: formatString(suggestion, paramData) });
      }
    }

    return completions;
  }

  protected getCustomParams(location?: ParamLocation): CustomParams[] {
    return (
      this.currentConfiguration?.customParams?.filter((param) => !param.location || param.location == location) || []
    );
  }

  protected getCustomTaskParams(location?: ParamLocation): CustomParams[] {
    return (
      this.currentConfiguration?.customTaskParams?.filter((param) => !param.location || param.location == location) ||
      []
    );
  }

  protected getCustomParamNames(location?: ParamLocation): string[] {
    return this.getCustomParams(location).map(({ name }) => name);
  }

  protected getCustomTaskParamNames(location?: ParamLocation): string[] {
    return this.getCustomTaskParams(location).map(({ name }) => name);
  }
}
