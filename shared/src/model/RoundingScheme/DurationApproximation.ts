import { TaskTypeName } from '../Task/Task';
import BasicTask from '../Task/BasicTask';

export default class DurationApproximation<T extends TaskTypeName = TaskTypeName> {
  public readonly task: BasicTask<T>;

  private _duration: number;
  private _error: number = 0;

  public constructor(task: BasicTask<T>, duration: number) {
    this.task = task;
    this._duration = duration;

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

  private init() {
    this.computeError();
  }

  private computeError() {
    this._error = this._duration - this.task.actualDuration;
  }
}
