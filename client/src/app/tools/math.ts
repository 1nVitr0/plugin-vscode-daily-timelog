import DurationApproximation from '../../model/DurationApproximation';
import { BasicSettings } from '../../model/Summary/Settings';
import { TaskTypeName } from '../../model/Task';

export function getLargestErrorDuration(
  durations: DurationApproximation<TaskTypeName>[],
  settings: BasicSettings,
  errorDirection: number = 1
): DurationApproximation<TaskTypeName> {
  errorDirection = errorDirection / Math.abs(errorDirection);
  const { forceMinimumDuration, floorBelowMinimumDuration, minimumDuration } = settings;
  const adjustedMinimumDuration = forceMinimumDuration ? minimumDuration : 0;

  return durations.reduce((max, current) => {
    const { duration, error } = current;
    // Don't adjust to 0 when forceMinimumDuration == true
    if (errorDirection > 0 && duration <= adjustedMinimumDuration) return max;
    // Don't adjust up when floorBelowMinimumDuration == true
    if (errorDirection < 0 && floorBelowMinimumDuration && duration === 0) return max;

    return error * errorDirection > max.error * errorDirection ? current : max;
  }, durations[0]);
}
