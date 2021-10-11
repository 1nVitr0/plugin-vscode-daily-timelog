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

    const amount = this.configuration.configuration.jiraMaxTasks || 50;
    this.tasks = (await this.api?.getAssignedTasks(amount)) || [];
  }

  public destroy() {
    if (this.interval) clearInterval(this.interval);
  }

  protected setup() {
    const { jiraAccountIds, jiraDomain, jiraToken, jiraUserEmail, jiraFetchInterval } =
      this.configuration.configuration;

    if (!jiraAccountIds || !jiraDomain || !jiraToken || !jiraUserEmail) return;

    this.api = new JiraApi(jiraDomain, jiraUserEmail, jiraToken);
    this.api.setUsers(jiraAccountIds);

    if (this.interval) clearInterval(this.interval);
    this.interval = setInterval(() => this.loadTasks, jiraFetchInterval);
    this.loadTasks();
  }
}
