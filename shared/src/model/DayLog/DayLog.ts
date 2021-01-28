import DurationApproximation from '../RoundingScheme/DurationApproximation';
import RoundingScheme from '../RoundingScheme/RoundingScheme';
import { BasicSettings } from '../Summary/Settings';
import Task, { TaskTypeName } from '../Task/Task';
import BasicTask from '../Task/BasicTask';
import { ConstructorType } from '../Types';
import WorkTask from '../Task/WorkTask';
import Break from '../Task/Break';

type TaskName = Task['name'];

export default interface DayLog<T extends TaskName = TaskName> {
  readonly date: Date;

  addTask(task: BasicTask<TaskTypeName>): void;
  addWorkTask(task: WorkTask): void;
  addBreak(_break: Break): void;

  getTasks(): BasicTask<TaskTypeName>[];
  getWorkTasks(): WorkTask[];
  getBreaks(): Break[];

  getTask(name: T): BasicTask<TaskTypeName> | null;
  getWorkTask(name: T): WorkTask | null;
  getBreak(name: T): Break | null;

  getApproximateTotals(roundingScheme: RoundingScheme): number;
  getApproximateTotals(roundingScheme: ConstructorType<typeof RoundingScheme>, settings: BasicSettings): number;

  getApproximateEstimatedTotals(roundingScheme: RoundingScheme): number;
  getApproximateEstimatedTotals(
    roundingScheme: ConstructorType<typeof RoundingScheme>,
    settings: BasicSettings
  ): number;

  getApproximateTaskDurations(roundingScheme: RoundingScheme): DurationApproximation<TaskTypeName>[];
  getApproximateTaskDurations(
    roundingScheme: ConstructorType<typeof RoundingScheme>,
    settings: BasicSettings
  ): DurationApproximation<TaskTypeName>[];

  getApproximateWorkTaskDurations(roundingScheme: RoundingScheme): DurationApproximation<'task'>[];
  getApproximateWorkTaskDurations(
    roundingScheme: ConstructorType<typeof RoundingScheme>,
    settings: BasicSettings
  ): DurationApproximation<'task'>[];

  getApproximateBreakDurations(roundingScheme: RoundingScheme): DurationApproximation<'break'>[];
  getApproximateBreakDurations(
    roundingScheme: ConstructorType<typeof RoundingScheme>,
    settings: BasicSettings
  ): DurationApproximation<'break'>[];

  getApproximateEstimatedTaskDurations(roundingScheme: RoundingScheme): DurationApproximation<TaskTypeName>[];
  getApproximateEstimatedTaskDurations(
    roundingScheme: ConstructorType<typeof RoundingScheme>,
    settings: BasicSettings
  ): DurationApproximation<TaskTypeName>[];

  getApproximateEstimatedWorkTaskDurations(roundingScheme: RoundingScheme): DurationApproximation<'task'>[];
  getApproximateEstimatedWorkTaskDurations(
    roundingScheme: ConstructorType<typeof RoundingScheme>,
    settings: BasicSettings
  ): DurationApproximation<'task'>[];

  getApproximateEstimatedBreakDurations(roundingScheme: RoundingScheme): DurationApproximation<'break'>[];
  getApproximateEstimatedBreakDurations(
    roundingScheme: ConstructorType<typeof RoundingScheme>,
    settings: BasicSettings
  ): DurationApproximation<'break'>[];
}
