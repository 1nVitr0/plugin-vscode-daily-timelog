import { Task } from 'vscode';
import { TaskTypeName } from '../Task/Task';
import { Duration } from '../Types';

type TaskName = typeof Task['name'];

interface NameDurationPair {
  /**
   * @TJS-pattern ^(\d+ h)?(\d+ m)?(\d+ s)?$
   */
  [key: string]: Duration;
}

export interface TaskDeclaration {
  description?: string;
  estimatedDuration: Duration;
  name: TaskName;
  group?: string;
  ticket?: string;
  comment?: string;
  link?: string;
  type?: TaskTypeName;
}

export type TaskDurationDeclaration = NameDurationPair | Omit<TaskDeclaration, 'name' | 'estimatedDuration'>;

type TaskList = (TaskDurationDeclaration | TaskDeclaration)[];
export default TaskList;
