import axios from 'axios';
import JiraTask from '../model/Jira/Task';
import JiraUser from '../model/Jira/User';

export default class JiraApi {
  protected headers: Record<string, string>;
  protected _currentUsers: JiraUser[] = [];

  public constructor(public readonly domain: string, protected user: string, protected token: string) {
    const auth = Buffer.from(`${user}:${token}`).toString('base64');
    this.headers = { Authorization: `Basic ${auth}`, Accept: 'application/json' };
  }

  public get currentUsers(): JiraUser[] {
    return this._currentUsers;
  }

  protected get accountIds(): string[] {
    return this._currentUsers.map(({ accountId }) => accountId);
  }

  public async getUsers(): Promise<JiraUser[]> {
    const response = await axios.get<JiraUser[]>('https://konsolenkost.atlassian.net/rest/api/2/users/search', {
      params: { maxResults: 0 },
      headers: this.headers,
    });

    return response.data;
  }

  public setUsers(users: JiraUser[] | string[]) {
    this._currentUsers = users.map((user) =>
      typeof user == 'object'
        ? user
        : {
            accountId: user,
            accountType: 'atlassian',
            active: true,
            avatarUrls: {},
            displayName: 'Unknown',
            locale: 'en-US',
            self: '',
          }
    );
  }

  public async getAssignedTasks(maxResults = 100): Promise<JiraTask[]> {
    const jql =
      (this.accountIds.length ? `assignee in (${this.accountIds.join(',')}) ` : '') +
      `ORDER BY updated DESC, created DESC`;
    const response = await axios.get<{ issues: JiraTask[] }>('https://konsolenkost.atlassian.net/rest/api/2/search', {
      params: { jql, fields: 'summary,status,assignee,creator,parent,priority,issuetype', maxResults },
      headers: this.headers,
    });

    return response.data.issues;
  }
}
