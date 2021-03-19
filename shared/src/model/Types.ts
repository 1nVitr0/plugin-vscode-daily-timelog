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

export type Constructor<T = {}> = new (...args: any[]) => T;
export type MixinFunction<T extends Constructor = Constructor, R extends T = T & Constructor> = (Base: T) => R;
type UnionToIntersection<T> = (T extends any ? (x: T) => any : never) extends (x: infer R) => any ? R : never;
export type MixinReturnValue<T extends MixinFunction<any, any>[]> = UnionToIntersection<
  { [K in keyof T]: T[K] extends MixinFunction<any, infer U> ? U : never }[number]
>;
