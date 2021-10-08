export default interface JiraUser {
  self: string;
  accountId: string;
  accountType: string;
  avatarUrls: Record<`${number}x${number}`, string>;
  displayName: string;
  active: boolean;
  locale: string;
}
