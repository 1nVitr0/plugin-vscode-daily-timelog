import Task from '../Task/Task';
import { Progress, Time } from '../Types';

type TaskName = Task['name'];

interface LogEntryBase<T extends TaskName> {
  comment?: string;
  progress?: Progress;
  task: T;
}

export interface LogEntryStyleStart<T extends TaskName = TaskName> extends LogEntryBase<T> {
  end?: Time;
  start: Time;
}

export interface LogEntryStyleEnd<T extends TaskName = TaskName> extends LogEntryBase<T> {
  end: Time;
  start?: Time;
}

export type LogEntry = LogEntryStyleStart | LogEntryStyleEnd;

export interface LogEntryEndTimeList<T extends TaskName = TaskName> {
  [key: string]: T | LogEntryBase<T>;
}

type TimeLog<T extends TaskName = TaskName> = LogEntryEndTimeList<T> | LogEntryStyleStart<T>[] | LogEntryStyleEnd<T>[];
export default TimeLog;
