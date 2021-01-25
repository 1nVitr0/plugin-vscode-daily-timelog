import Task from '../Task';

type Summary = {
  [k: string]: Omit<Task, 'name'>;
};
export default Summary;
