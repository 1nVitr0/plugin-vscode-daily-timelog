export type Progress = number | 'DONE';
export type Time = string;
export type Duration = string;

export type ConstructorType<T> = T extends { new (...args: infer R): any }
  ? new (...args: R) => InstanceType<T>
  : never;
