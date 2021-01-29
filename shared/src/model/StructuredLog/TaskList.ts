import { Task } from 'vscode';
import { TaskTypeName } from '../Task/Task';
import { Duration } from '../Types';

type TaskName = typeof Task['name'];

export interface TaskDeclaration<T extends TaskName = TaskName> {
  description?: string;
  estimatedDuration?: Duration;
  // Defaults to 'task'
  name: TaskName;
  type?: TaskTypeName;
}

export interface TaskDurationList<T extends TaskName = TaskName> {
  [key: string]: Duration | TaskDeclaration<T>;
}

type TaskList<T extends TaskName = TaskName> = TaskDurationList<T> | TaskDeclaration<T>[];
export default TaskList;
