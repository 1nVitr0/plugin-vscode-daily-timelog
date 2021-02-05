import Task, { TaskTypeName } from './Task';
import BasicTask from './BasicTask';
import WorkTask from './WorkTask';
import Break from './Break';
import {
  LogEntryEndTimeDeclaration,
  LogEntryStyleEnd,
  LogEntryStyleStart,
  TaskDeclaration,
  TaskDurationDeclaration,
} from '../..';
import { isKeyOf } from '../../tools/typings';
import { parseDuration, parseTime } from '../../tools/time';

export default class TaskFactory {
  public constructor() {}

  public static logEntryFromDeclaration<T extends LogEntryStyleEnd | LogEntryStyleStart>(
    declaration: T extends LogEntryStyleStart ? LogEntryStyleStart : LogEntryStyleEnd | LogEntryEndTimeDeclaration
  ): T extends LogEntryStyleStart ? LogEntryStyleStart : LogEntryStyleEnd {
    if ('task' in declaration)
      return declaration as T extends LogEntryStyleStart ? LogEntryStyleStart : LogEntryStyleEnd;

    const dummyKeys: Record<keyof LogEntryStyleStart | keyof LogEntryStyleEnd, any> = {
      task: 1,
      comment: 1,
      end: 1,
      progress: 1,
      start: 1,
    };
    const logEntry: Partial<LogEntryStyleStart | LogEntryStyleEnd> = {};
    for (const key of Object.keys(declaration)) {
      // @ts-ignore: Needed due to declaration[key]
      if (isKeyOf<LogEntryStyleStart | LogEntryStyleEnd>(key, dummyKeys)) logEntry[key] = declaration[key];
      // @ts-ignore: Needed due to declaration[key]
      else [logEntry.task, logEntry.end] = [declaration[key], key];
    }

    return logEntry as T extends LogEntryStyleStart ? LogEntryStyleStart : LogEntryStyleEnd;
  }

  private static taskFromDeclaration(declaration: TaskDeclaration | TaskDurationDeclaration | Task): Task {
    if ('actualDuration' in declaration) return declaration as Task;
    if ('name' in declaration && 'estimatedDuration' in declaration) {
      const task: Task = { ...declaration, actualDuration: 0, completed: false } as Task;
      task.type = task.type || 'task';
      return task;
    }

    const dummyKeys: Record<keyof TaskDeclaration, any> = { name: 1, estimatedDuration: 1, description: 1, type: 1 };
    const task: Partial<Task> = {};
    for (const key of Object.keys(declaration)) {
      // @ts-ignore: Needed due to declaration[key]
      if (isKeyOf<TaskDeclaration>(key, dummyKeys)) task[key] = declaration[key];
      // @ts-ignore: Needed due to declaration[key]
      else [task.name, task.estimatedDuration] = [key, parseDuration(declaration[key])];
    }

    task.type = task.type || 'task';
    return { ...task, actualDuration: 0, completed: false } as Task;
  }

  public fromData<T extends TaskTypeName>(
    _data: Task<T> | TaskDeclaration | TaskDurationDeclaration
  ): BasicTask<TaskTypeName> {
    const declaration = TaskFactory.taskFromDeclaration(_data);
    const { type, name, description, estimatedDuration, actualDuration, completed } = declaration;

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

    task.execute(actualDuration);
    if (completed) task.complete();

    return task;
  }
}
