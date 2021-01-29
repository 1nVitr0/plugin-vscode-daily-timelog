export default interface Task<T extends TaskTypeName = TaskTypeName> {
  actualDuration: number;
  completed: boolean;
  description?: string;
  estimatedDuration: number;
  name: string;
  type: T;
}

export enum TaskType {
  task,
  break,
}

export type TaskTypeName = keyof typeof TaskType;
