import RoundingScheme from './RoundingScheme';
import DurationApproximation from '../../model/DurationApproximation';
import { BasicSettings } from '../../model/Summary/Settings';
import { TaskTypeName } from '../../model/Task';
import BasicTask from '../../model/Task/BasicTask';
import { getLargestErrorDuration } from '../tools/math';

export type PrecisionRoundingFunction = (number: number, precision?: number) => number;
export type BasicRoundingType = 'round' | 'floor' | 'ceil';

export default class BasicRoundingScheme<T extends TaskTypeName = TaskTypeName> extends RoundingScheme<T> {
  private roundingFunction: PrecisionRoundingFunction = BasicRoundingScheme.roundToPrecision;

  public constructor(tasks: BasicTask<T>[], settings: BasicSettings) {
    super(tasks, settings);
    this.setRoundingFunction(settings.durationRounding);
  }

  public getApproximateDurations(): DurationApproximation<T>[] {
    return this.calculateDurations(this.tasks);
  }

  public getApproximateTotal(): number {
    const total = this.tasks.reduce((sum, task) => sum + task.actualDuration, 0);
    return this.roundingFunction.call(this, total, this.settings.durationPrecision);
  }

  public getApproximateEstimatedDurations(): DurationApproximation<T>[] {
    return this.calculateDurations(this.tasks, true);
  }
  public getApproximateEstimatedTotal(): number {
    const total = this.tasks.reduce((sum, task) => sum + task.estimatedDuration, 0);
    return this.roundingFunction.call(this, total, this.settings.durationPrecision);
  }

  public setRoundingFunction(type: BasicRoundingType | PrecisionRoundingFunction) {
    if (typeof type === 'function') return (this.roundingFunction = type);

    switch (type) {
      case 'round':
        return (this.roundingFunction = BasicRoundingScheme.roundToPrecision);
      case 'floor':
        return (this.roundingFunction = BasicRoundingScheme.floorToPrecision);
      case 'ceil':
        return (this.roundingFunction = BasicRoundingScheme.ceilToPrecision);
    }
  }

  protected calculateDurations(tasks: readonly BasicTask<T>[], estimated = false): DurationApproximation<T>[] {
    const durations = tasks.map((task) => {
      const duration = this.roundingFunction.call(
        this,
        estimated ? task.estimatedDuration : task.actualDuration,
        this.settings.durationPrecision
      );
      return new DurationApproximation<T>(task, duration);
    });

    this.adjustMinimumDurations(durations);
    this.balanceDurations(durations);
    return durations;
  }

  protected balanceDurations(durations: DurationApproximation<T>[]) {
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

  protected adjustMinimumDurations(durations: DurationApproximation<T>[]) {
    const { minimumDuration, forceMinimumDuration, floorBelowMinimumDuration } = this.settings;

    if (!(forceMinimumDuration || floorBelowMinimumDuration)) return;

    for (const duration of durations) {
      if (duration.duration < minimumDuration) {
        if (forceMinimumDuration) duration.duration = minimumDuration;
        else if (floorBelowMinimumDuration) duration.duration = 0;
      }
    }
  }
}
