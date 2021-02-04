import BasicTask from './BasicTask';

export default class Break extends BasicTask<'break'> {
  public readonly type = 'break';

  public take() {
    this.execute(this.estimatedDuration.asMinutes());
    this.complete();
  }
}
