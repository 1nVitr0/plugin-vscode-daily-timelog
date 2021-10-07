import moment from 'moment';
import {
  BasicDayLog,
  BasicRoundingScheme,
  DurationApproximation,
  DurationListParams,
  formatCustomParams,
  formatDate,
  formatDuration,
  formatProgress,
  formatString,
  OverviewParams,
  Settings,
  TaskTypeName,
} from '../../../shared/out';

export default class SummaryGenerator {
  private dayLog: BasicDayLog;
  private settings: Settings;

  public constructor(dayLog: BasicDayLog, settings: Settings) {
    this.dayLog = dayLog;
    this.settings = settings;
  }

  public generateOverview(): string {
    const formatParams: OverviewParams = {
      ...this.getFormatParams('summary'),
      taskList: this.generateTaskList(),
      summary: this.generateSummary(),
    };
    const lines = this.settings.overviewStructure.map((line) => formatString(line, formatParams));

    return lines.join('\n');
  }

  public generateSummary(): string {
    const formatParams = this.getFormatParams('summary');
    const lines = this.settings.summaryStructure.map((line, index) =>
      formatString(line, { ...formatParams, index, nextIndex: index + 1 })
    );

    return lines.join('\n');
  }

  public generateTaskList(): string {
    const formatParams = this.getFormatParams('taskList');
    const lines = this.settings.taskListStructure.map((line, index) =>
      formatString(line, { ...formatParams, index, nextIndex: index + 1 })
    );

    return lines.join('\n');
  }

  private formatDurationList(durations: DurationApproximation<TaskTypeName>[], _durationFormat?: string): string {
    const durationFormat = _durationFormat || this.settings.taskListDurationFormat;
    return durations
      .map((durationInfo, index) => {
        const duration = {
          index,
          nextIndex: index + 1,
          progress: durationInfo.task.progress ? formatProgress(durationInfo.task.progress, this.settings) : null,
          duration: formatDuration(durationInfo.duration, this.settings),
          error: (durationInfo.error > 0 ? '+' : '') + formatDuration(durationInfo.error, this.settings),
          task: durationInfo.task,
        };
        return formatString(durationFormat, duration);
      })
      .join('\n');
  }

  private getFormatParams(type: 'taskList' | 'summary' = 'taskList'): DurationListParams {
    const { customParams, taskListDurationFormat, summaryDurationFormat } = this.settings;
    const durationFormat = type == 'taskList' ? taskListDurationFormat : summaryDurationFormat;

    const durations = this.dayLog.getApproximateTaskDurations(BasicRoundingScheme, this.settings);
    const estimatedDurations = this.dayLog.getApproximateEstimatedTaskDurations(BasicRoundingScheme, this.settings);
    const totals = this.dayLog.getApproximateTotals(BasicRoundingScheme, this.settings);
    const estimatedTotals = this.dayLog.getApproximateEstimatedTotals(BasicRoundingScheme, this.settings);

    return {
      ...this.settings,
      ...formatCustomParams(this.dayLog.customParams, customParams),
      date: formatDate(moment(this.dayLog.date), this.settings, true),
      durations: this.formatDurationList(durations, durationFormat),
      estimatedDurations: this.formatDurationList(estimatedDurations),
      totals: formatDuration(totals),
      estimatedTotals: formatDuration(estimatedTotals),
    };
  }
}
