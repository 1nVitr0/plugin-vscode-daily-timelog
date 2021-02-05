import { TaskTypeName } from '../Task/Task';
import BasicTask from '../Task/BasicTask';

export default class DurationApproximation<T extends TaskTypeName = TaskTypeName> {
  public readonly task: BasicTask<T>;

  private _duration: number;
  private _error: number = 0;
  private estimated: boolean;

  public constructor(task: BasicTask<T>, duration: number, estimated = false) {
    this.task = task;
    this._duration = duration;
    this.estimated = estimated;

    this.init();
  }

  public get duration() {
    return this._duration;
  }

  public set duration(duration: number) {
    this._duration = duration;
    this.computeError();
  }

  public get error(): number {
    return this._error;
  }

  private computeError() {
    this._error =
      this._duration -
      (this.estimated ? this.task.estimatedDuration.asMinutes() : this.task.actualDuration.asMinutes());
  }

  private init() {
    this.computeError();
  }
}
