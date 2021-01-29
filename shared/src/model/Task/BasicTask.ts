import Task, { TaskTypeName } from './Task';

export default abstract class BasicTask<T extends TaskTypeName> implements Task<T> {
  public readonly description?: string;
  public readonly name: string;
  public abstract readonly type: T;

  protected _actualDuration: number = 0;
  protected _completed: boolean = false;
  protected _estimatedDuration: number = 0;

  public constructor(name: string, estimatedDuration?: number);
  public constructor(name: string, description?: string, estimatedDuration?: number);
  public constructor(name: string, descriptionOrEstimatedDuration: string | number = 0, estimatedDuration: number = 0) {
    const description = typeof descriptionOrEstimatedDuration === 'string' ? descriptionOrEstimatedDuration : undefined;

    this.name = name;
    this.description = description;
  }

  public get actualDuration() {
    return this._actualDuration;
  }

  public get completed() {
    return this._completed;
  }

  public get estimatedDuration() {
    return this._estimatedDuration;
  }

  public set estimatedDuration(newEstimation: number) {
    this.estimatedDuration = newEstimation;
  }

  public complete() {
    this._completed = true;
  }

  public execute(time: number) {
    this._actualDuration += time;
  }

  public getTimeDifference() {
    return this._actualDuration - this.estimatedDuration;
  }
}
