import BasicRoundingScheme from '../../app/BasicRoundingScheme';
import {
  getInitializedRoundingScheme,
  getApproximateDurations,
  getApproximateEstimatedDurations,
} from '../../tools/approximateDurations';
import DayLog from '../DayLog/DayLog';
import { defaultBasicSettings } from '../Defaults/DefaultSummarySettings';
import DurationApproximation from '../RoundingScheme/DurationApproximation';
import RoundingScheme from '../RoundingScheme/RoundingScheme';
import { BasicSettings } from '../Summary/Settings';
import BasicTask from '../Task/BasicTask';
import Break from '../Task/Break';
import Task, { TaskTypeName } from '../Task/Task';
import WorkTask from '../Task/WorkTask';
import { ConstructorType } from '../Types';

type TaskName = Task['name'];

export default class BasicDayLog<T extends TaskName = TaskName> implements DayLog {
  public readonly date: Date;

  private tasks: Record<string, BasicTask<TaskTypeName>> = {};

  public constructor(date: Date = new Date(), tasks: BasicTask<TaskTypeName>[] = []) {
    this.date = date;
    for (const task of tasks) this.addTask(task);
  }

  public addBreak(_break: Break) {
    this.addTask(_break);
  }

  public addTask(task: BasicTask<TaskTypeName>) {
    this.tasks[task.name] = task;
  }

  public addWorkTask(task: WorkTask) {
    this.addTask(task);
  }

  public getApproximateBreakDurations(
    _roundingScheme: RoundingScheme | ConstructorType<typeof BasicRoundingScheme>,
    settings: BasicSettings = defaultBasicSettings
  ): DurationApproximation<'break'>[] {
    return getApproximateEstimatedDurations(_roundingScheme, settings, this.getBreaks());
  }

  public getApproximateEstimatedBreakDurations(
    _roundingScheme: RoundingScheme | ConstructorType<typeof BasicRoundingScheme>,
    settings: BasicSettings = defaultBasicSettings
  ): DurationApproximation<'break'>[] {
    return getApproximateEstimatedDurations(_roundingScheme, settings, this.getBreaks());
  }

  public getApproximateEstimatedTaskDurations(
    _roundingScheme: RoundingScheme | ConstructorType<typeof BasicRoundingScheme>,
    settings: BasicSettings = defaultBasicSettings
  ): DurationApproximation<TaskTypeName>[] {
    return getApproximateEstimatedDurations(_roundingScheme, settings, this.getTasks());
  }

  public getApproximateEstimatedTotals(
    _roundingScheme: RoundingScheme | ConstructorType<typeof BasicRoundingScheme>,
    settings: BasicSettings = defaultBasicSettings
  ): number {
    const tasks = settings.includeBreaksInTotal ? this.getTasks() : this.getWorkTasks();
    const roundingScheme = getInitializedRoundingScheme(_roundingScheme, settings, tasks);
    return roundingScheme.getApproximateEstimatedTotal();
  }

  public getApproximateEstimatedWorkTaskDurations(
    _roundingScheme: RoundingScheme | ConstructorType<typeof BasicRoundingScheme>,
    settings: BasicSettings = defaultBasicSettings
  ): DurationApproximation<'task'>[] {
    return getApproximateEstimatedDurations(_roundingScheme, settings, this.getWorkTasks());
  }

  public getApproximateTaskDurations(
    _roundingScheme: RoundingScheme | ConstructorType<typeof BasicRoundingScheme>,
    settings: BasicSettings = defaultBasicSettings
  ): DurationApproximation<TaskTypeName>[] {
    return getApproximateDurations(_roundingScheme, settings, this.getTasks());
  }

  public getApproximateTotals(
    _roundingScheme: RoundingScheme | ConstructorType<typeof BasicRoundingScheme>,
    settings: BasicSettings = defaultBasicSettings
  ): number {
    const tasks = settings.includeBreaksInTotal ? this.getTasks() : this.getWorkTasks();
    const roundingScheme = getInitializedRoundingScheme(_roundingScheme, settings, tasks);
    return roundingScheme.getApproximateTotal();
  }

  public getApproximateWorkTaskDurations(
    _roundingScheme: RoundingScheme | ConstructorType<typeof BasicRoundingScheme>,
    settings: BasicSettings = defaultBasicSettings
  ): DurationApproximation<'task'>[] {
    return getApproximateDurations(_roundingScheme, settings, this.getWorkTasks());
  }

  public getBreak(name: string): Break | null {
    const task = this.tasks[name];
    if (task.type === 'break') return task as Break;
    else return null;
  }

  public getBreaks(): Break[] {
    return this.getTasks().filter((task) => task.type === 'break') as Break[];
  }

  public getTask(name: string): BasicTask<TaskTypeName> | null {
    return this.tasks[name] || null;
  }

  public getTasks(): BasicTask<TaskTypeName>[] {
    const taskNames = Object.keys(this.tasks);
    return taskNames.map((name) => this.tasks[name]);
  }

  public getWorkTask(name: string): WorkTask | null {
    const task = this.tasks[name];
    if (task.type === 'task') return task as WorkTask;
    else return null;
  }

  public getWorkTasks(): WorkTask[] {
    return this.getTasks().filter((task) => task.type === 'task') as WorkTask[];
  }
}
