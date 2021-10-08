import axios from 'axios';
import JiraTask from '../model/Jira/Task';
import JiraUser from '../model/Jira/User';

export default class JiraApi {
  protected headers: Record<string, string>;
  protected _currentUser: JiraUser | null = null;

  public constructor(public readonly domain: string, protected user: string, protected token: string) {
    const auth = Buffer.from(`${user}:${token}`).toString('base64');
    this.headers = { Authorization: `Basic ${auth}`, Accept: 'application/json' };
  }

  public get currentUser(): JiraUser | null {
    return this._currentUser;
  }

  protected get accountId(): string | null {
    return this._currentUser?.accountId || null;
  }

  public async getUsers(): Promise<JiraUser[]> {
    const response = await axios.get<JiraUser[]>('https://konsolenkost.atlassian.net/rest/api/2/users/search', {
      headers: this.headers,
    });

    return response.data;
  }

  public setUser(user: JiraUser) {
    this._currentUser = user;
  }

  public async getAssignedTasks(maxResults = 100): Promise<JiraTask[]> {
    const jql = (this.accountId ? `assignee in (${this.accountId}) ` : '') + `ORDER BY updated DESC, created DESC`;
    const response = await axios.get<JiraTask[]>('https://konsolenkost.atlassian.net/rest/api/2/search', {
      params: { jql, fields: 'summary', maxResults },
      headers: this.headers,
    });

    return response.data;
  }
}
