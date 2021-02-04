import { Task } from 'vscode';
import { TaskTypeName } from '../Task/Task';
import { Duration } from '../Types';

type TaskName = typeof Task['name'];

export interface TaskDeclaration {
  description?: string;
  estimatedDuration: Duration;
  name: TaskName;
  type?: TaskTypeName;
}

export type TaskDurationDeclaration =
  | {
      [key: string]: Duration;
    }
  | Omit<TaskDeclaration, 'name' | 'estimatedDuration'>;

type TaskList = (TaskDurationDeclaration | TaskDeclaration)[];
export default TaskList;
