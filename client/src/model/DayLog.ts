import BasicRoundingScheme from '../app/RoundingScheme/BasicRoundingScheme';
import RoundingScheme from '../app/RoundingScheme/RoundingScheme';
import DurationApproximation from './DurationApproximation';
import { BasicSettings } from './Summary/Settings';
import Task, { TaskTypeName, WorkTask, Break } from './Task';
import BasicTask from './Task/BasicTask';
import { ConstructorType } from './Types';

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
  getApproximateTotals(roundingScheme: ConstructorType<typeof BasicRoundingScheme>, settings: BasicSettings): number;

  getApproximateEstimatedTotals(roundingScheme: RoundingScheme): number;
  getApproximateEstimatedTotals(
    roundingScheme: ConstructorType<typeof BasicRoundingScheme>,
    settings: BasicSettings
  ): number;

  getApproximateTaskDurations(roundingScheme: RoundingScheme): DurationApproximation<TaskTypeName>[];
  getApproximateTaskDurations(
    roundingScheme: ConstructorType<typeof BasicRoundingScheme>,
    settings: BasicSettings
  ): DurationApproximation<TaskTypeName>[];

  getApproximateWorkTaskDurations(roundingScheme: RoundingScheme): DurationApproximation<'task'>[];
  getApproximateWorkTaskDurations(
    roundingScheme: ConstructorType<typeof BasicRoundingScheme>,
    settings: BasicSettings
  ): DurationApproximation<'task'>[];

  getApproximateBreakDurations(roundingScheme: RoundingScheme): DurationApproximation<'break'>[];
  getApproximateBreakDurations(
    roundingScheme: ConstructorType<typeof BasicRoundingScheme>,
    settings: BasicSettings
  ): DurationApproximation<'break'>[];

  getApproximateEstimatedTaskDurations(roundingScheme: RoundingScheme): DurationApproximation<TaskTypeName>[];
  getApproximateEstimatedTaskDurations(
    roundingScheme: ConstructorType<typeof BasicRoundingScheme>,
    settings: BasicSettings
  ): DurationApproximation<TaskTypeName>[];

  getApproximateEstimatedWorkTaskDurations(roundingScheme: RoundingScheme): DurationApproximation<'task'>[];
  getApproximateEstimatedWorkTaskDurations(
    roundingScheme: ConstructorType<typeof BasicRoundingScheme>,
    settings: BasicSettings
  ): DurationApproximation<'task'>[];

  getApproximateEstimatedBreakDurations(roundingScheme: RoundingScheme): DurationApproximation<'break'>[];
  getApproximateEstimatedBreakDurations(
    roundingScheme: ConstructorType<typeof BasicRoundingScheme>,
    settings: BasicSettings
  ): DurationApproximation<'break'>[];
}
