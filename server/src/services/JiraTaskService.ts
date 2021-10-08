import ConfigurationService from './ConfigurationService';
import { JiraTask, JiraApi } from '../../../shared/out';

export default class JiraTaskService {
  public tasks: JiraTask[] = [];
  protected api: JiraApi | null = null;
  protected accountId: string = '';
  protected interval: ReturnType<typeof setInterval> | null = null;

  public constructor(private configuration: ConfigurationService) {
    configuration.on('configurationChange', () => this.setup());
    this.setup();
  }

  public async loadTasks() {
    if (!this.api) this.setup();
    const tasks = (await this.api?.getAssignedTasks()) || [];
    this.tasks = (await this.api?.getAssignedTasks()) || [];
  }

  protected setup() {
    const { jiraAccountId, jiraDomain, jiraToken, jiraUserEmail, jiraFetchInterval } = this.configuration.configuration;

    if (!jiraAccountId || !jiraDomain || !jiraToken || !jiraUserEmail) return;

    this.api = new JiraApi(jiraDomain, jiraUserEmail, jiraToken);
    this.api.setUser(jiraAccountId);

    if (this.interval) clearInterval(this.interval);
    this.interval = setInterval(() => this.loadTasks, jiraFetchInterval);
    this.loadTasks();
  }
}
