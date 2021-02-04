import moment from 'moment';
import { isKeyOf } from '../../tools/typings';
import { TaskDeclaration, TaskDurationDeclaration } from '../StructuredLog/TaskList';
import Task, { TaskTypeName } from './Task';

export default abstract class BasicTask<T extends TaskTypeName> implements Task<T> {
  public readonly description?: string;
  public readonly name: string;
  public abstract readonly type: T;

  protected _actualDuration: moment.Duration = moment.duration(0);
  protected _completed: boolean = false;
  protected _estimatedDuration: moment.Duration = moment.duration(0);

  public constructor(declaration: TaskDeclaration | TaskDurationDeclaration);
  public constructor(name: string, estimatedDuration?: number | moment.Duration);
  public constructor(name: string, description?: string, estimatedDuration?: number | moment.Duration);
  public constructor(
    _name: string | TaskDeclaration | TaskDurationDeclaration,
    _description: string | number | moment.Duration = 0,
    estimatedDuration: number | moment.Duration = 0
  ) {
    const name = typeof _name == 'string' ? _name : '';
    const description = typeof _description === 'string' ? _description : undefined;

    this.name = name;
    this.description = description;
    this.estimatedDuration =
      typeof estimatedDuration == 'number' ? moment.duration(estimatedDuration, 'm') : estimatedDuration;
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

  public set estimatedDuration(newEstimation) {
    this.estimatedDuration = newEstimation;
  }

  public complete() {
    this._completed = true;
  }

  public execute(time: number | moment.Duration) {
    this.actualDuration.add(time, 'm');
  }

  public getTimeDifference() {
    return this.actualDuration.clone().subtract(this.estimatedDuration);
  }
}
