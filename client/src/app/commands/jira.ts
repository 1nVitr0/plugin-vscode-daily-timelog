import { env, Uri, window, workspace } from 'vscode';
import { JiraApi } from '../../../../shared/out';

export async function setupJiraToken() {
  const item = await window.showInformationMessage(
    'Please visit your Atlassian profile page and set up an API Token. Copy it and return here.',
    'Open profile page'
  );
  if (item) env.openExternal(Uri.parse('https://id.atlassian.com/manage-profile/security/api-tokens'));
  const token = await window.showInputBox({
    title: 'Enter your atlassian API token:',
    placeHolder: 'TOKEN',
    password: true,
  });
  const domain = await window.showInputBox({ title: 'Enter your atlassian domain:', placeHolder: 'DOMAIN' });
  const email = await window.showInputBox({ title: 'Enter your atlassian email:', placeHolder: `user@${domain}.com` });

  if (!token) return null;

  const configuration = workspace.getConfiguration('daily-timelog');
  await configuration.update('jiraToken', token);
  await configuration.update('jiraDomain', domain);
  await configuration.update('jiraUserEmail', email);

  return { token, domain, user: email };
}

export async function setupJiraUser(domain?: string, email?: string, token?: string) {
  const configuration = workspace.getConfiguration('daily-timelog');

  if (!domain) domain = configuration.get('jiraDomain');
  if (!email) email = configuration.get('jiraUserEmail');
  if (!token) token = configuration.get('jiraToken');

  if (!domain || !email || !token) {
    window.showErrorMessage('No Jira token set up. Please run `Daily TimeLog: setup Jira token` first.');
    return null;
  }

  const api = new JiraApi(domain, email, token);
  const users = await api.getUsers();

  const selectedUser = await window.showQuickPick(users.map(({ displayName }) => displayName));
  const accountId = users.find(({ displayName }) => displayName == selectedUser)?.accountId;

  if (!accountId) return null;

  await configuration.update('jiraAccountId', accountId);

  return accountId;
}

export async function setupJira() {
  const { domain, user, token } = await setupJiraToken();
  await setupJiraUser(domain, user, token);
}
