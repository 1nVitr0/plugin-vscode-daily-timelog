import { TaskFactory } from '..';
import DayLog from '../model/DayLog/DayLog';
import { defaultBasicSettings } from '../model/Defaults/DefaultSummarySettings';
import DurationApproximation from '../model/RoundingScheme/DurationApproximation';
import RoundingScheme from '../model/RoundingScheme/RoundingScheme';
import StructuredLog from '../model/StructuredLog/StructuredLog';
import TimeLog, {
  LogEntryEndTimeDeclaration,
  LogEntryStyleEnd,
  LogEntryStyleStart,
} from '../model/StructuredLog/TimeLog';
import { BasicSettings } from '../model/Summary/Settings';
import BasicTask from '../model/Task/BasicTask';
import Break from '../model/Task/Break';
import Task, { TaskTypeName } from '../model/Task/Task';
import WorkTask from '../model/Task/WorkTask';
import { ConstructorType } from '../model/Types';
import {
  getApproximateDurations,
  getApproximateEstimatedDurations,
  getInitializedRoundingScheme,
} from '../tools/approximateDurations';
import { parseTime } from '../tools/time';
import BasicRoundingScheme from './BasicRoundingScheme';

type TaskName = Task['name'];

export default class BasicDayLog implements DayLog {
  public readonly date: Date;

  private tasks: Record<string, BasicTask<TaskTypeName>> = {};

  public constructor(date: Date = new Date(), tasks: BasicTask<TaskTypeName>[] = []) {
    this.date = date;
    for (const task of tasks) this.addTask(task);
  }

  public static fromStructuredLog(log: StructuredLog, includeUnplanned = false): BasicDayLog {
    const factory = new TaskFactory();
    const tasks = log.plannedTasks?.map((task) => factory.fromData(task));

    const result = new BasicDayLog(new Date(), tasks);
    if (log.timeLog) result.applyLog(log.timeLog, includeUnplanned);

    return result;
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

  public applyLog(_log: TimeLog, addMissing = false) {
    if (!_log.length) return;
    const first = _log[0];

    if ('start' in first) {
      const log = _log as LogEntryStyleStart[];
      this.applyLogStyleStart(
        log.map((entry) => TaskFactory.logEntryFromDeclaration<LogEntryStyleStart>(entry)),
        addMissing
      );
    } else {
      const log = _log as (LogEntryStyleEnd | LogEntryEndTimeDeclaration)[];
      this.applyLogStyleEnd(
        log.map((entry) => TaskFactory.logEntryFromDeclaration<LogEntryStyleEnd>(entry)),
        addMissing
      );
    }
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

  public getBreak(name: TaskName): Break | null {
    const task = this.tasks[name];
    if (task.type === 'break') return task as Break;
    else return null;
  }

  public getBreaks(): Break[] {
    return this.getTasks().filter((task) => task.type === 'break') as Break[];
  }

  public getTask(name: TaskName): BasicTask<TaskTypeName> | null {
    return this.tasks[name] || null;
  }

  public getTasks(): BasicTask<TaskTypeName>[] {
    const taskNames = Object.keys(this.tasks);
    return taskNames.map((name) => this.tasks[name]);
  }

  public getWorkTask(name: TaskName): WorkTask | null {
    const task = this.tasks[name];
    if (task.type === 'task') return task as WorkTask;
    else return null;
  }

  public getWorkTasks(): WorkTask[] {
    return this.getTasks().filter((task) => task.type === 'task') as WorkTask[];
  }

  private applyLogStyleEnd(_log: LogEntryStyleEnd[], addMissing = false) {
    if (!_log.length) return;

    const log = [..._log];
    let previous = log.shift();
    let current: LogEntryStyleEnd | undefined;

    while ((current = log.shift())) {
      const duration = parseTime(current.end).diff(parseTime(previous?.end || current.end), 'm');
      if (addMissing && !this.getTask(current.task)) this.addTask(new WorkTask(current.task));
      this.getTask(current.task)?.execute(duration);
      previous = current;
    }
  }

  private applyLogStyleStart(_log: LogEntryStyleStart[], addMissing = false) {
    if (!_log.length) return;

    const log = [..._log];
    let current = log.shift();
    let next: LogEntryStyleStart | undefined;

    while ((next = log.shift())) {
      const duration = parseTime(current?.end || next.start).diff(parseTime(current?.start || next.start), 'm');
      if (addMissing && current && !this.getTask(current.task)) this.addTask(new WorkTask(current.task));
      if (current) this.getTask(current.task)?.execute(duration);
      current = next;
    }

    if (current?.end) {
      const duration = parseTime(current.start).diff(parseTime(current.end), 'm');
      this.getTask(current.task)?.execute(duration);
    }
  }
}
