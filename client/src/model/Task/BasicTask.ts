import Task, { TaskTypeName } from '.';

export default abstract class BasicTask<T extends TaskTypeName> implements Task<T> {
  public abstract readonly type: T;
  public readonly name: string;
  public readonly description?: string;

  protected _estimatedDuration: number = 0;
  protected _completed: boolean = false;
  protected _actualDuration: number = 0;

  public constructor(name: string, estimatedDuration?: number);
  public constructor(name: string, description?: string, estimatedDuration?: number);
  public constructor(name: string, descriptionOrEstimatedDuration: string | number = 0, estimatedDuration: number = 0) {
    const description = typeof descriptionOrEstimatedDuration === 'string' ? descriptionOrEstimatedDuration : undefined;

    this.name = name;
    this.description = description;
  }

  public get estimatedDuration() {
    return this._estimatedDuration;
  }
  public set estimatedDuration(newEstimation: number) {
    this.estimatedDuration = newEstimation;
  }

  public get actualDuration() {
    return this._actualDuration;
  }
  public get completed() {
    return this._completed;
  }

  public getTimeDifference() {
    return this._actualDuration - this.estimatedDuration;
  }

  public execute(time: number) {
    this._actualDuration += time;
  }
  public complete() {
    this._completed = true;
  }
}
