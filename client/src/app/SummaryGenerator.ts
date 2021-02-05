import {
  BasicDayLog,
  Settings,
  formatString,
  BasicRoundingScheme,
  DurationApproximation,
  DurationListParams,
  formatDate,
  formatDuration,
  OverviewParams,
  TaskTypeName,
} from '../../../shared/out';
import moment from 'moment';

export default class SummaryGenerator {
  private dayLog: BasicDayLog;
  private settings: Settings;

  public constructor(dayLog: BasicDayLog, settings: Settings) {
    this.dayLog = dayLog;
    this.settings = settings;
  }

  public generateOverview(): string {
    const formatParams: OverviewParams = {
      ...this.getFormatParams(),
      taskList: this.generateTaskList(),
      summary: this.generateSummary(),
    };
    const lines = this.settings.overviewStructure.map((line) => formatString(line, formatParams));

    return lines.join('\n');
  }

  public generateSummary(): string {
    const formatParams = this.getFormatParams();
    const lines = this.settings.summaryStructure.map((line) => formatString(line, formatParams));

    return lines.join('\n');
  }

  public generateTaskList(): string {
    const formatParams = this.getFormatParams();
    const lines = this.settings.taskListStructure.map((line) => formatString(line, formatParams));

    return lines.join('\n');
  }

  private formatDurationList(durations: DurationApproximation<TaskTypeName>[], separator = '\n'): string {
    const { taskListDurationFormat } = this.settings;
    return durations
      .map((durationInfo) => {
        const duration = {
          duration: formatDuration(durationInfo.duration, this.settings),
          error: (durationInfo.error > 0 ? '+' : '') + formatDuration(durationInfo.error, this.settings),
          task: durationInfo.task,
        };
        return formatString(taskListDurationFormat, duration);
      })
      .join('\n');
  }

  private getFormatParams(): DurationListParams {
    const { timeFormat, durationFormat } = this.settings;

    const durations = this.dayLog.getApproximateTaskDurations(BasicRoundingScheme, this.settings);
    const estimatedDurations = this.dayLog.getApproximateEstimatedTaskDurations(BasicRoundingScheme, this.settings);
    const totals = this.dayLog.getApproximateTotals(BasicRoundingScheme, this.settings);
    const estimatedTotals = this.dayLog.getApproximateEstimatedTotals(BasicRoundingScheme, this.settings);

    return {
      ...this.settings,
      date: formatDate(moment(this.dayLog.date), this.settings),
      durations: this.formatDurationList(durations),
      estimatedDurations: this.formatDurationList(estimatedDurations),
      totals: formatDuration(totals),
      estimatedTotals: formatDuration(estimatedTotals),
    };
  }
}
