import DurationApproximation from './DurationApproximation';
import { BasicSettings } from '../Settings/Settings';
import { TaskTypeName } from '../Task/Task';
import BasicTask from '../Task/BasicTask';

export type PrecisionRoundingFunction = (number: number, precision?: number) => number;
export type RoundingType = 'round' | 'floor' | 'ceil';

export default abstract class RoundingScheme {
  public readonly settings: BasicSettings;

  protected roundingFunction: PrecisionRoundingFunction = RoundingScheme.roundToPrecision;

  private _tasks: BasicTask<TaskTypeName>[];

  public constructor(tasks: BasicTask<TaskTypeName>[], settings: BasicSettings) {
    this._tasks = tasks;
    this.settings = settings;

    this.setRoundingFunction(settings.durationRounding);
  }

  public get tasks(): readonly BasicTask<TaskTypeName>[] {
    return this._tasks;
  }

  public set tasks(tasks: readonly BasicTask<TaskTypeName>[]) {
    this._tasks = tasks as BasicTask<TaskTypeName>[];
  }

  protected static ceilToPrecision(number: number, precision: number = 1): number {
    return Math.ceil(number / precision) * precision;
  }

  protected static floorToPrecision(number: number, precision: number = 1): number {
    return Math.floor(number / precision) * precision;
  }

  protected static roundToPrecision(number: number, precision: number = 1): number {
    return Math.round(number / precision) * precision;
  }

  public ceil(n: number): number {
    return RoundingScheme.ceilToPrecision(n, this.settings.durationPrecision);
  }

  public floor(n: number): number {
    return RoundingScheme.floorToPrecision(n, this.settings.durationPrecision);
  }

  public round(n: number): number {
    return RoundingScheme.roundToPrecision(n, this.settings.durationPrecision);
  }

  public setRoundingFunction(type: RoundingType | PrecisionRoundingFunction) {
    if (typeof type === 'function') return (this.roundingFunction = type);

    switch (type) {
      case 'round':
        return (this.roundingFunction = RoundingScheme.roundToPrecision);
      case 'floor':
        return (this.roundingFunction = RoundingScheme.floorToPrecision);
      case 'ceil':
        return (this.roundingFunction = RoundingScheme.ceilToPrecision);
    }
  }

  public abstract getApproximateDurations(): DurationApproximation<TaskTypeName>[];
  public abstract getApproximateEstimatedDurations(): DurationApproximation<TaskTypeName>[];
  public abstract getApproximateEstimatedTotal(): number;
  public abstract getApproximateTotal(): number;
}
