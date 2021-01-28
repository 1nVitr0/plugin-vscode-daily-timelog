import Task, { TaskTypeName } from './Task';
import BasicTask from './BasicTask';
import WorkTask from './WorkTask';
import Break from './Break';

export default class TaskFactory {
  public constructor() {}

  public fromData<T extends TaskTypeName>(data: Task<T>): BasicTask<T | TaskTypeName> {
    let task: BasicTask<T | TaskTypeName>;
    switch (data.type) {
      case 'task':
        task = new WorkTask(data.name, data.description, data.estimatedDuration);
        break;
      case 'break':
        task = new Break(data.name, data.description, data.estimatedDuration);
        break;
      default:
        throw new Error(`unknown task type: ${data.type}`);
    }

    task.execute(data.actualDuration);
    if (data.completed) task.complete();

    return task;
  }
}
