import DurationApproximation from '../model/RoundingScheme/DurationApproximation';
import RoundingScheme from '../model/RoundingScheme/RoundingScheme';
import { TaskTypeName } from '../model/Task/Task';
import BasicTask from '../model/Task/BasicTask';
import { getLargestErrorDuration } from '../tools/math';
import Break from '../model/Task/Break';

export default class BasicRoundingScheme extends RoundingScheme {
  public getApproximateDurations(): DurationApproximation[] {
    return this.calculateDurations(this.tasks);
  }

  public getApproximateEstimatedDurations(): DurationApproximation[] {
    return this.calculateDurations(this.tasks, true);
  }

  public getApproximateEstimatedTotal(): number {
    const total = this.tasks.reduce((sum, task) => sum + task.estimatedDuration.asMinutes(), 0);
    return this.roundingFunction.call(this, total, this.settings.durationPrecision);
  }

  public getApproximateTotal(): number {
    const total = this.tasks.reduce((sum, task) => sum + task.actualDuration.asMinutes(), 0);
    return this.roundingFunction.call(this, total, this.settings.durationPrecision);
  }

  protected adjustMinimumDurations(durations: DurationApproximation[]) {
    const { minimumDuration, forceMinimumDuration, floorBelowMinimumDuration } = this.settings;

    if (!(forceMinimumDuration || floorBelowMinimumDuration)) return;

    for (const duration of durations) {
      if (duration.duration < minimumDuration) {
        if (forceMinimumDuration) duration.duration = minimumDuration;
        else if (floorBelowMinimumDuration) duration.duration = 0;
      }
    }
  }

  protected balanceDurations(durations: DurationApproximation[]) {
    const totalError = durations.reduce((sum, duration) => sum + duration.error, 0);
    let approximateError = this.roundingFunction.call(this, totalError, this.settings.durationPrecision);

    while (Math.abs(approximateError) > 0) {
      const errorDirection = approximateError / Math.abs(approximateError);
      const largestContributor = getLargestErrorDuration(durations, this.settings, errorDirection);

      const change = errorDirection * this.settings.durationPrecision;
      largestContributor.duration -= change;
      approximateError -= change;
    }
  }

  protected calculateDurations(_tasks: readonly BasicTask<TaskTypeName>[], estimated = false): DurationApproximation[] {
    const tasks = this.squashBreaks(_tasks);
    const durations = tasks.map((task) => {
      const duration = this.roundingFunction.call(
        this,
        estimated ? task.estimatedDuration.asMinutes() : task.actualDuration.asMinutes(),
        this.settings.durationPrecision
      );
      return new DurationApproximation(task, duration, estimated);
    });

    this.excludeZeroDurations(durations);
    this.adjustMinimumDurations(durations);
    this.balanceDurations(durations);
    return durations;
  }

  protected excludeZeroDurations(durations: DurationApproximation[]) {
    for (let i = 0; i < durations.length; i++) {
      if (!durations[i].duration) durations.splice(i--, 1);
    }
  }

  protected squashBreaks(tasks: readonly BasicTask[]): BasicTask[] {
    if (this.settings.combineBreaks) {
      const breaks: BasicTask[] = [];
      const workTasks: BasicTask[] = [];
      for (const task of tasks) {
        if (task.type == 'break') breaks.push(task);
        else workTasks.push(task);
      }
      const squashed = new Break(this.settings.defaultBreakName, 0);
      for (const b of breaks) {
        squashed.estimatedDuration = squashed.estimatedDuration.add(b.estimatedDuration);
        squashed.execute(b.actualDuration);
      }

      return [...workTasks, squashed];
    } else return [...tasks];
  }
}
