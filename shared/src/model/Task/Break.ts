import { extractBreak } from '../../tools/string';
import { TaskDeclaration } from '../StructuredLog/TaskList';
import BasicTask from './BasicTask';

export default class Break extends BasicTask<'break'> {
  public readonly type = 'break';

  public constructor(declaration: TaskDeclaration);
  public constructor(name: string, estimatedDuration?: number | moment.Duration);
  public constructor(name: string, description?: string, estimatedDuration?: number | moment.Duration);
  public constructor(
    _name: string | TaskDeclaration,
    _description?: string | number | moment.Duration,
    _estimatedDuration?: number | moment.Duration
  ) {
    super(
      ...((typeof _name == 'string'
        ? [extractBreak(_name), _description, _estimatedDuration]
        : [_name]) as ConstructorParameters<typeof Break>)
    );
  }

  public take() {
    this.execute(this.estimatedDuration.asMinutes());
    this.complete();
  }
}
