import DurationApproximation from '../RoundingScheme/DurationApproximation';
import RoundingScheme from '../RoundingScheme/RoundingScheme';
import { BasicSettings } from '../Summary/Settings';
import Task, { TaskTypeName } from '../Task/Task';
import BasicTask from '../Task/BasicTask';
import { ConstructorType } from '../Types';
import WorkTask from '../Task/WorkTask';
import Break from '../Task/Break';

type TaskName = Task['name'];
type RoundingSchemeConstructor = ConstructorType<typeof RoundingScheme>;

export default interface DayLog<T extends TaskName = TaskName> {
  readonly customParams: { [key: string]: string | string[] };
  readonly date: Date;

  addBreak(_break: Break): void;
  addTask(task: BasicTask<TaskTypeName>): void;
  addWorkTask(task: WorkTask): void;
  getApproximateBreakDurations(roundingScheme: RoundingScheme): DurationApproximation<'break'>[];
  getApproximateBreakDurations(
    roundingScheme: RoundingSchemeConstructor,
    settings: BasicSettings
  ): DurationApproximation<'break'>[];
  getApproximateEstimatedBreakDurations(roundingScheme: RoundingScheme): DurationApproximation<'break'>[];
  getApproximateEstimatedBreakDurations(
    roundingScheme: RoundingSchemeConstructor,
    settings: BasicSettings
  ): DurationApproximation<'break'>[];
  getApproximateEstimatedTaskDurations(roundingScheme: RoundingScheme): DurationApproximation<TaskTypeName>[];
  getApproximateEstimatedTaskDurations(
    roundingScheme: RoundingSchemeConstructor,
    settings: BasicSettings
  ): DurationApproximation<TaskTypeName>[];
  getApproximateEstimatedTotals(roundingScheme: RoundingScheme): number;
  getApproximateEstimatedTotals(roundingScheme: RoundingSchemeConstructor, settings: BasicSettings): number;
  getApproximateEstimatedWorkTaskDurations(roundingScheme: RoundingScheme): DurationApproximation<'task'>[];
  getApproximateEstimatedWorkTaskDurations(
    roundingScheme: RoundingSchemeConstructor,
    settings: BasicSettings
  ): DurationApproximation<'task'>[];
  getApproximateTaskDurations(roundingScheme: RoundingScheme): DurationApproximation<TaskTypeName>[];
  getApproximateTaskDurations(
    roundingScheme: RoundingSchemeConstructor,
    settings: BasicSettings
  ): DurationApproximation<TaskTypeName>[];
  getApproximateTotals(roundingScheme: RoundingScheme): number;
  getApproximateTotals(roundingScheme: RoundingSchemeConstructor, settings: BasicSettings): number;
  getApproximateWorkTaskDurations(roundingScheme: RoundingScheme): DurationApproximation[];
  getApproximateWorkTaskDurations(
    roundingScheme: RoundingSchemeConstructor,
    settings: BasicSettings
  ): DurationApproximation<'task'>[];
  getBreak(name: T): Break | null;
  getBreaks(): Break[];
  getTask(name: T): BasicTask<TaskTypeName> | null;
  getTasks(): BasicTask<TaskTypeName>[];
  getWorkTask(name: T): WorkTask | null;
  getWorkTasks(): WorkTask[];
}
