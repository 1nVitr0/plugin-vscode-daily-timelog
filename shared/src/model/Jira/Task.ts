import IssueType from './IssueType';
import JiraStatus from './Status';
import JiraUser from './User';

export default interface JiraTask {
  expand?: string;
  id: string;
  self: string;
  key: string;
  fields: {
    summary: string;
    assignee?: JiraUser;
    creator?: JiraUser;
    status: JiraStatus;
    issuetype: IssueType;
    parent?: JiraTask;
    [key: string]: string | JiraUser | JiraStatus | IssueType | JiraTask | undefined;
  };
}
