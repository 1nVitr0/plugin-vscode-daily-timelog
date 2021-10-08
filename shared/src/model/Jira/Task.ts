export default interface JiraTask {
  expand: string;
  id: string;
  self: string;
  key: string;
  fields: {
    summary: string;
    [key: string]: string | undefined;
  };
}
