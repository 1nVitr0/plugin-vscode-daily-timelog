import DayLog from '../../model/DayLog';
import DurationApproximation from '../../model/DurationApproximation';
import { BasicSettings } from '../../model/Summary/Settings';
import Task, { Break, TaskTypeName, WorkTask } from '../../model/Task';
import BasicTask from '../../model/Task/BasicTask';
import { ConstructorType } from '../../model/Types';
import { defaultBasicSettings } from '../Defaults/SummarySettings';
import BasicRoundingScheme from '../RoundingScheme/BasicRoundingScheme';
import RoundingScheme from '../RoundingScheme/RoundingScheme';
import {
  getApproximateDurations,
  getApproximateEstimatedDurations,
  getInitializedRoundingScheme,
} from '../tools/approximateDurations';

type TaskName = Task['name'];

export default class BasicDayLog<T extends TaskName = TaskName> implements DayLog {
  public readonly date: Date;
  private tasks: Record<string, BasicTask<TaskTypeName>> = {};

  public constructor(date: Date = new Date(), tasks: BasicTask<TaskTypeName>[] = []) {
    this.date = date;
    for (const task of tasks) this.addTask(task);
  }

  public addTask(task: BasicTask<TaskTypeName>) {
    this.tasks[task.name] = task;
  }
  public addWorkTask(task: WorkTask) {
    this.addTask(task);
  }
  public addBreak(_break: Break) {
    this.addTask(_break);
  }

  public getTasks(): BasicTask<TaskTypeName>[] {
    const taskNames = Object.keys(this.tasks);
    return taskNames.map((name) => this.tasks[name]);
  }
  public getWorkTasks(): WorkTask[] {
    return this.getTasks().filter((task) => task.type === 'task') as WorkTask[];
  }
  public getBreaks(): Break[] {
    return this.getTasks().filter((task) => task.type === 'break') as Break[];
  }

  public getTask(name: T): BasicTask<TaskTypeName> | null {
    return this.tasks[name] || null;
  }
  public getWorkTask(name: T): WorkTask | null {
    const task = this.tasks[name];
    if (task.type === 'task') return task as WorkTask;
    else return null;
  }
  public getBreak(name: T): Break | null {
    const task = this.tasks[name];
    if (task.type === 'break') return task as Break;
    else return null;
  }

  public getApproximateTotals(
    _roundingScheme: RoundingScheme | ConstructorType<typeof BasicRoundingScheme>,
    settings: BasicSettings = defaultBasicSettings
  ): number {
    const tasks = settings.includeBreaksInTotal ? this.getTasks() : this.getWorkTasks();
    const roundingScheme = getInitializedRoundingScheme(_roundingScheme, settings, tasks);
    return roundingScheme.getApproximateTotal();
  }

  public getApproximateEstimatedTotals(
    _roundingScheme: RoundingScheme | ConstructorType<typeof BasicRoundingScheme>,
    settings: BasicSettings = defaultBasicSettings
  ): number {
    const tasks = settings.includeBreaksInTotal ? this.getTasks() : this.getWorkTasks();
    const roundingScheme = getInitializedRoundingScheme(_roundingScheme, settings, tasks);
    return roundingScheme.getApproximateEstimatedTotal();
  }

  public getApproximateTaskDurations(
    _roundingScheme: RoundingScheme | ConstructorType<typeof BasicRoundingScheme>,
    settings: BasicSettings = defaultBasicSettings
  ): DurationApproximation<TaskTypeName>[] {
    return getApproximateDurations(_roundingScheme, settings, this.getTasks());
  }

  public getApproximateWorkTaskDurations(
    _roundingScheme: RoundingScheme | ConstructorType<typeof BasicRoundingScheme>,
    settings: BasicSettings = defaultBasicSettings
  ): DurationApproximation<'task'>[] {
    return getApproximateDurations(_roundingScheme, settings, this.getWorkTasks());
  }

  public getApproximateBreakDurations(
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

  public getApproximateEstimatedWorkTaskDurations(
    _roundingScheme: RoundingScheme | ConstructorType<typeof BasicRoundingScheme>,
    settings: BasicSettings = defaultBasicSettings
  ): DurationApproximation<'task'>[] {
    return getApproximateEstimatedDurations(_roundingScheme, settings, this.getWorkTasks());
  }

  public getApproximateEstimatedBreakDurations(
    _roundingScheme: RoundingScheme | ConstructorType<typeof BasicRoundingScheme>,
    settings: BasicSettings = defaultBasicSettings
  ): DurationApproximation<'break'>[] {
    return getApproximateEstimatedDurations(_roundingScheme, settings, this.getBreaks());
  }
}
