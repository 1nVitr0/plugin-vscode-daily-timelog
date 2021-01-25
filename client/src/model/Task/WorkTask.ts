import { TaskType } from '.';
import BasicTask from './BasicTask';

export class WorkTask extends BasicTask<'task'> {
  public readonly type = 'task';
}
