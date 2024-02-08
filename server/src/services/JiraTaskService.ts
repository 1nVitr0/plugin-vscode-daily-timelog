import ConfigurationService from './ConfigurationService';
import { JiraTask, JiraApi } from '../../../shared/out';

export default class JiraTaskService {
  public tasks: JiraTask[] = [];
  protected api: JiraApi | null = null;
  protected accountId: string = '';
  protected token: string = '';
  protected interval: ReturnType<typeof setInterval> | null = null;

  public constructor(private configuration: ConfigurationService) {
    configuration.on('configurationChange', () => this.setup(this.token));
  }

  public setToken(token: string) {
    this.token = token;
    this.setup(token);
  }

  public async loadTasks() {
    if (!this.api) this.setup(this.token);

    const amount = this.configuration.configuration.jiraMaxTasks || 50;
    try {
      this.tasks = (await this.api?.getAssignedTasks(amount)) || [];
    } catch (e) {
      console.error(e);
    }
  }

  public destroy() {
    if (this.interval) clearInterval(this.interval);
  }

  protected setup(jiraToken: string) {
    const { jiraAccountIds, jiraDomain, jiraUserEmail, jiraFetchInterval } =
      this.configuration.configuration;

    if (!jiraAccountIds || !jiraDomain || !jiraToken || !jiraUserEmail) return;

    this.api = new JiraApi(jiraDomain, jiraUserEmail, jiraToken);
    this.api.setUsers(jiraAccountIds);

    if (this.interval) clearInterval(this.interval);
    this.interval = setInterval(() => this.loadTasks, jiraFetchInterval);
    this.loadTasks();
  }
}
