import StructuredLog from './StructuredLog/StructuredLog';
import TimeLog from './StructuredLog/TimeLog';

export type Progress = number | 'DONE';
export type Time = string;
export type Duration = string;

export type ConstructorType<T> = T extends { new (...args: infer R): any }
  ? new (...args: R) => InstanceType<T>
  : never;

export type PathTree<T> = {
  [P in keyof T]: Path<T[P]> extends undefined ? [P?] : [P?, ...Path<T[P]>];
};
export type Path<T> = Exclude<PathTree<T>[keyof T], undefined>;

export type PathLeafesTree<T> = {
  [P in keyof T]: PathLeafes<T[P]> extends undefined ? [P?] : [P?, ...PathLeafes<T[P]>];
};
export type PathLeafes<T> = Exclude<PathLeafesTree<T>[keyof T], undefined>;
