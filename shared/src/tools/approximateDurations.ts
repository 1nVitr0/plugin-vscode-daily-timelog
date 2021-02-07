import BasicRoundingScheme from '../app/BasicRoundingScheme';
import DurationApproximation from '../model/RoundingScheme/DurationApproximation';
import RoundingScheme from '../model/RoundingScheme/RoundingScheme';
import { BasicSettings } from '../model/Summary/Settings';
import { TaskTypeName } from '../model/Task/Task';
import BasicTask from '../model/Task/BasicTask';
import { ConstructorType } from '../model/Types';

export function getInitializedRoundingScheme(
  _roundingScheme: RoundingScheme | ConstructorType<typeof BasicRoundingScheme>,
  _settings: BasicSettings,
  tasks: BasicTask[]
): RoundingScheme {
  const roundingScheme = (typeof _roundingScheme === 'function'
    ? new _roundingScheme(tasks, _settings)
    : _roundingScheme) as RoundingScheme;

  if (typeof _roundingScheme !== 'function') roundingScheme.tasks = tasks;

  return roundingScheme;
}

export function getApproximateDurations<T extends TaskTypeName = TaskTypeName>(
  _roundingScheme: RoundingScheme | ConstructorType<typeof BasicRoundingScheme>,
  settings: BasicSettings,
  tasks: BasicTask<T>[]
): DurationApproximation<T>[] {
  const roundingScheme = getInitializedRoundingScheme(_roundingScheme, settings, tasks);
  return roundingScheme.getApproximateDurations() as DurationApproximation<T>[];
}

export function getApproximateEstimatedDurations<T extends TaskTypeName = TaskTypeName>(
  _roundingScheme: RoundingScheme | ConstructorType<typeof BasicRoundingScheme>,
  settings: BasicSettings,
  tasks: BasicTask<T>[]
): DurationApproximation<T>[] {
  const roundingScheme = getInitializedRoundingScheme(_roundingScheme, settings, tasks);
  return roundingScheme.getApproximateEstimatedDurations() as DurationApproximation<T>[];
}
