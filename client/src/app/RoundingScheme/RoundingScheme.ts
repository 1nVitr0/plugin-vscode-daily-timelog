import DurationApproximation from '../../model/DurationApproximation';
import { BasicSettings } from '../../model/Summary/Settings';
import { TaskTypeName } from '../../model/Task';
import BasicTask from '../../model/Task/BasicTask';

export default abstract class RoundingScheme<T extends TaskTypeName = TaskTypeName> {
  public readonly settings: BasicSettings;
  private _tasks: BasicTask<T>[];

  public constructor(tasks: BasicTask<T>[], settings: BasicSettings) {
    this._tasks = tasks;
    this.settings = settings;
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

  public abstract getApproximateDurations(): DurationApproximation<T>[];
  public abstract getApproximateEstimatedDurations(): DurationApproximation<T>[];
  public abstract getApproximateTotal(): number;
  public abstract getApproximateEstimatedTotal(): number;
}
