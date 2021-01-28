export default interface Task<T extends TaskTypeName = TaskTypeName> {
  type: T;
  name: string;
  description?: string;
  completed: boolean;
  estimatedDuration: number;
  actualDuration: number;
}

export enum TaskType {
  task,
  break,
}

export type TaskTypeName = keyof typeof TaskType;
