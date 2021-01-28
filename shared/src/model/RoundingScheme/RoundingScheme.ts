import DurationApproximation from './DurationApproximation';
import { BasicSettings } from '../Summary/Settings';
import { TaskTypeName } from '../Task/Task';
import BasicTask from '../Task/BasicTask';

export type PrecisionRoundingFunction = (number: number, precision?: number) => number;
export type RoundingType = 'round' | 'floor' | 'ceil';

export default abstract class RoundingScheme<T extends TaskTypeName = TaskTypeName> {
  public readonly settings: BasicSettings;
  protected roundingFunction: PrecisionRoundingFunction = RoundingScheme.roundToPrecision;
  private _tasks: BasicTask<T>[];

  public constructor(tasks: BasicTask<T>[], settings: BasicSettings) {
    this._tasks = tasks;
    this.settings = settings;

    this.setRoundingFunction(settings.durationRounding);
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

  protected static roundToPrecision(number: number, precision: number = 1): number {
    return Math.round(number / precision) * precision;
  }

  protected static floorToPrecision(number: number, precision: number = 1): number {
    return Math.floor(number / precision) * precision;
  }

  protected static ceilToPrecision(number: number, precision: number = 1): number {
    return Math.ceil(number / precision) * precision;
  }

  public set tasks(tasks: readonly BasicTask<T>[]) {
    this._tasks = tasks as BasicTask<T>[];
  }
  public get tasks(): readonly BasicTask<T>[] {
    return this._tasks;
  }

  public round(n: number): number {
    return RoundingScheme.roundToPrecision(n, this.settings.durationPrecision);
  }
  public floor(n: number): number {
    return RoundingScheme.floorToPrecision(n, this.settings.durationPrecision);
  }
  public ceil(n: number): number {
    return RoundingScheme.ceilToPrecision(n, this.settings.durationPrecision);
  }

  public abstract getApproximateDurations(): DurationApproximation<T>[];
  public abstract getApproximateEstimatedDurations(): DurationApproximation<T>[];
  public abstract getApproximateTotal(): number;
  public abstract getApproximateEstimatedTotal(): number;
}
