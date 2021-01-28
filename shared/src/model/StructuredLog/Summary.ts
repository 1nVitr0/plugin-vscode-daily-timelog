import Task from '../Task/Task';

type Summary = {
  [k: string]: Omit<Task, 'name'>;
};
export default Summary;
