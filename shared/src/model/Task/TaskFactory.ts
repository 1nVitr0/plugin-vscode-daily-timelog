import Task, { TaskTypeName } from './Task';
import BasicTask from './BasicTask';
import WorkTask from './WorkTask';
import Break from './Break';
import {
  LogEntryEndTimeDeclaration,
  LogEntryStyleEnd,
  LogEntryStyleStart,
  Settings,
  TaskDeclaration,
  TaskDurationDeclaration,
  CustomParams,
} from '../..';
import { isKeyOf } from '../../tools/typings';
import { parseDuration } from '../../tools/time';
import { extractBreak, isBreak } from '../../tools/string';

export default class TaskFactory {
  public constructor(protected customParams: CustomParams[]) {}

  public static logEntryFromDeclaration<T extends LogEntryStyleEnd | LogEntryStyleStart>(
    declaration: T extends LogEntryStyleStart ? LogEntryStyleStart : LogEntryStyleEnd | LogEntryEndTimeDeclaration,
    customParams?: Settings['customTaskParams']
  ): T extends LogEntryStyleStart ? LogEntryStyleStart : LogEntryStyleEnd {
    if ('task' in declaration)
      return declaration as T extends LogEntryStyleStart ? LogEntryStyleStart : LogEntryStyleEnd;

    const dummyKeys: Record<keyof LogEntryStyleStart | keyof LogEntryStyleEnd, any> & Record<string, any> = {
      task: 1,
      comment: 1,
      end: 1,
      progress: 1,
      start: 1,
    };
    if (customParams) for (const { name } of customParams) dummyKeys[name] = 1;
    const logEntry: Partial<LogEntryStyleStart | LogEntryStyleEnd> = {};
    for (const key of Object.keys(declaration)) {
      // @ts-ignore: Needed due to declaration[key]
      if (isKeyOf<LogEntryStyleStart | LogEntryStyleEnd>(key, dummyKeys)) logEntry[key] = declaration[key];
      // @ts-ignore: Needed due to declaration[key]
      else [logEntry.task, logEntry.end] = [declaration[key], key];
    }

    return logEntry as T extends LogEntryStyleStart ? LogEntryStyleStart : LogEntryStyleEnd;
  }

  private static taskFromDeclaration(
    declaration: TaskDeclaration | TaskDurationDeclaration | Task,
    customParams?: Settings['customTaskParams']
  ): Task {
    if (!declaration) throw new Error('task declaration is missing');
    if ('actualDuration' in declaration) return declaration as Task;
    if ('name' in declaration && 'estimatedDuration' in declaration) {
      const task: Task = { ...declaration, actualDuration: 0, completed: false } as Task;
      task.type = task.type || 'task';
      return task;
    }

    const dummyKeys: Record<keyof TaskDeclaration, any> & Record<string, any> = {
      name: 1,
      estimatedDuration: 1,
      description: 1,
      comment: 1,
      group: 1,
      link: 1,
      ticket: 1,
      type: 1,
    };
    if (customParams) for (const { name } of customParams) dummyKeys[name] = 1;
    const task: Partial<Task> = {};
    for (const key of Object.keys(declaration)) {
      // @ts-ignore: Needed due to declaration[key]
      if (isKeyOf<TaskDeclaration>(key, dummyKeys)) task[key] = declaration[key];
      else {
        // @ts-ignore: Needed due to declaration[key]
        const duration: string = declaration[key];
        task.type = isBreak(duration || '') ? 'break' : 'task';
        [task.name, task.estimatedDuration] = [key, parseDuration(extractBreak(duration))];
      }
    }

    return { ...task, actualDuration: 0, completed: false } as Task;
  }

  public fromData<T extends TaskTypeName>(
    _data: Task<T> | TaskDeclaration | TaskDurationDeclaration
  ): BasicTask<TaskTypeName> {
    const declaration = TaskFactory.taskFromDeclaration(_data, this.customParams);
    const { type, name, description, estimatedDuration, actualDuration, completed, comment, group, progress } =
      declaration;

    let task: BasicTask<T | TaskTypeName>;
    switch (type) {
      case 'task':
        task = new WorkTask(name, description, estimatedDuration);
        break;
      case 'break':
        task = new Break(name, description, estimatedDuration);
        break;
      default:
        throw new Error(`unknown task type: ${type}`);
    }

    task.comment = comment;
    task.group = group;
    task.progress = progress;
    // @ts-ignore Untyped dynamic properties
    for (const { name } of this.customParams) task[name] = declaration[name];
    task.execute(actualDuration);
    if (completed) task.complete();

    return task;
  }
}
