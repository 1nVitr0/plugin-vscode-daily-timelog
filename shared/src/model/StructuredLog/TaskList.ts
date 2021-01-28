import { Task } from 'vscode';
import { TaskTypeName } from '../Task/Task';
import { Duration } from '../Types';

type TaskName = typeof Task['name'];

export interface TaskDeclaration<T extends TaskName = TaskName> {
  type?: TaskTypeName; // Defaults to 'task'
  name: TaskName;
  description?: string;
  estimatedDuration?: Duration;
}

export interface TaskDurationList<T extends TaskName = TaskName> {
  [key: string]: Duration | TaskDeclaration<T>;
}

type TaskList<T extends TaskName = TaskName> = TaskDurationList<T> | TaskDeclaration<T>[];
export default TaskList;
