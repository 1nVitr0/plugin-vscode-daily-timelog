import Summary from './Summary';
import TaskList, { TaskDeclaration } from './TaskList';
import TimeLog from './TimeLog';

type StructuredLog = {
  date: Date;
  summary?: Summary;
} & ({ plannedTasks: TaskList; timeLog?: TimeLog } | { plannedTasks?: TaskList; timeLog: TimeLog });
export default StructuredLog;
