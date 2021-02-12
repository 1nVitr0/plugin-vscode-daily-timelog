export default interface Task<T extends TaskTypeName = TaskTypeName> {
  actualDuration: number | moment.Duration;
  completed: boolean;
  description?: string;
  estimatedDuration: number | moment.Duration;
  name: string;
  progress?: number;
  type: T;
}

export enum TaskType {
  task,
  break,
}

export type TaskTypeName = keyof typeof TaskType;
