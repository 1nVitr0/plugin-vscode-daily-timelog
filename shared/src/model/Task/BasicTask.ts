import moment from 'moment';
import { parseDuration } from '../../tools/time';
import { TaskDeclaration, TaskDurationDeclaration } from '../StructuredLog/TaskList';
import Task, { TaskTypeName } from './Task';

export default abstract class BasicTask<T extends TaskTypeName = TaskTypeName> implements Task<T> {
  public readonly description?: string;
  public readonly name: string;
  public abstract readonly type: T;

  protected _actualDuration: moment.Duration = moment.duration(0);
  protected _completed: boolean = false;
  protected _estimatedDuration: moment.Duration = moment.duration(0);

  public constructor(declaration: TaskDeclaration);
  public constructor(name: string, estimatedDuration?: number | moment.Duration);
  public constructor(name: string, description?: string, estimatedDuration?: number | moment.Duration);
  public constructor(
    _name: string | TaskDeclaration,
    _description?: string | number | moment.Duration,
    _estimatedDuration: number | moment.Duration = 0
  ) {
    const name = typeof _name == 'string' ? _name : _name.name;
    const description =
      typeof _name != 'string' ? _name.description : typeof _description === 'string' ? _description : undefined;
    const estimatedDuration =
      typeof _name != 'string'
        ? parseDuration(_name.estimatedDuration)
        : typeof _description == 'object' || typeof _description == 'number'
        ? _description
        : _estimatedDuration;

    this.name = name;
    this.description = description;
    this._estimatedDuration =
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
    this._estimatedDuration = newEstimation;
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
