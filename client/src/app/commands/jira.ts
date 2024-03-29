import { env, Uri, window, workspace, commands, ExtensionContext, SecretStorage } from 'vscode';
import { JiraApi, Secrets } from '../../../../shared/out';

const JIRA_TOKEN_URL = 'https://id.atlassian.com/manage-profile/security/api-tokens';

export async function setupJiraToken(context: ExtensionContext) {
  const item = await window.showInformationMessage(
    'Please visit your Atlassian profile page and set up an API Token. Copy it and return here.',
    'Open profile page',
    'I have an API token'
  );
  if (item == 'Open profile page') {
    env.openExternal(Uri.parse(JIRA_TOKEN_URL));
    const answer = await window.showInformationMessage(
      'After creating anc copying your API Token, click `Continue`',
      'Continue',
      'Restart'
    );
    if (answer !== 'Continue') {
      if (answer) commands.executeCommand('daily-timelog.setupJiraToken');
      return {};
    }
  }
  const token = await window.showInputBox({
    title: 'Enter your atlassian API token:',
    placeHolder: 'TOKEN',
    password: true,
    ignoreFocusOut: true,
    validateInput: (input) => (!input ? 'Please enter a valid token' : undefined),
  });
  const domain = await window.showInputBox({
    title: 'Enter your atlassian domain:',
    placeHolder: 'DOMAIN',
    ignoreFocusOut: true,
    validateInput: (input) => (!input ? 'Please enter a valid domain' : undefined),
  });
  const email = await window.showInputBox({
    title: 'Enter your atlassian email:',
    placeHolder: `user@${domain}.com`,
    ignoreFocusOut: true,
    validateInput: (input) => (!input ? 'Please enter a valid email' : undefined),
  });

  if (!token || !domain || !email) {
    window.showErrorMessage('Invalid credentials');
    return {};
  }

  const secrets = context.secrets as Secrets;
  const configuration = workspace.getConfiguration('daily-timelog');
  try {
    await configuration.update('jiraDomain', domain);
    await configuration.update('jiraUserEmail', email);
    await secrets.store('jiraToken', token);
  } catch (e) {
    console.error(e);
  }

  return { token, domain, user: email };
}

export async function setupJiraUser(context: ExtensionContext, domain?: string, email?: string, token?: string) {
  const secrets = context.secrets as Secrets;
  const configuration = workspace.getConfiguration('daily-timelog');

  if (!domain) domain = configuration.get('jiraDomain');
  if (!email) email = configuration.get('jiraUserEmail');
  if (!token) token = await secrets.get('jiraToken');

  if (!domain || !email || !token) {
    window.showErrorMessage('No Jira token set up. Please run `Daily TimeLog: setup Jira token` first.');
    return null;
  }

  const api = new JiraApi(domain, email, token);
  const users = await api.getUsers();

  const selectedUsers = await window.showQuickPick(
    users.map(({ displayName }) => displayName),
    {
      title: 'Select current Jira user',
      placeHolder: 'USER',
      ignoreFocusOut: true,
      canPickMany: true,
    }
  );
  if (!selectedUsers) return null;
  const accountIds = users
    .filter(({ displayName }) => selectedUsers.indexOf(displayName) >= 0)
    .map(({ accountId }) => accountId);

  await configuration.update('jiraAccountIds', accountIds);

  return accountIds;
}

export async function setupJira(context: ExtensionContext) {
  const { domain, user, token } = await setupJiraToken(context);
  if (!domain || !user || !token) return;
  await setupJiraUser(context, domain, user, token);
}


export async function updateJiraTasks() {
  const configuration = workspace.getConfiguration('daily-timelog');
  const previous = configuration.get('jiraFetchInterval', 1800000);

  // Force reset of JiraTaskService
  await configuration.update('jiraFetchInterval', Infinity);
  await configuration.update('jiraFetchInterval', previous);
}
