import BasicTask from './BasicTask';

export default class WorkTask extends BasicTask<'task'> {
  public readonly type = 'task';
}
