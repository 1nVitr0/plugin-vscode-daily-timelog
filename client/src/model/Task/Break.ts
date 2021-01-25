import { TaskType } from '.';
import BasicTask from './BasicTask';

export class Break extends BasicTask<'break'> {
  public readonly type = 'break';

  public take() {
    this.execute(this.estimatedDuration);
    this.complete();
  }
}
