import Task from '../Task/Task';
import { Progress, Time } from '../Types';

type TaskName = Task['name'];

interface LogEntryBase {
  comment?: string;
  progress?: Progress;
  task: TaskName;
}

export interface LogEntryStyleStart extends LogEntryBase {
  end?: Time;
  start: Time;
}

export interface LogEntryStyleEnd extends LogEntryBase {
  end: Time;
}

export type LogEntry = LogEntryStyleStart | LogEntryStyleEnd;

export type LogEntryEndTimeDeclaration =
  | {
      [key: string]: TaskName;
    }
  | Omit<LogEntryStyleEnd, 'task' | 'end'>;

type TimeLog = (LogEntryEndTimeDeclaration | LogEntryStyleEnd)[] | LogEntryStyleStart[];
export default TimeLog;
