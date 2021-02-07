import {
  TaskTypeName,
  RoundingScheme,
  ConstructorType,
  BasicRoundingScheme,
  BasicSettings,
  BasicTask,
  DurationApproximation,
} from '../../../../shared/out';

export function getInitializedRoundingScheme<T extends TaskTypeName = TaskTypeName>(
  _roundingScheme: RoundingScheme | ConstructorType<typeof BasicRoundingScheme>,
  _settings: BasicSettings,
  tasks: BasicTask<T>[]
): RoundingScheme {
  const roundingScheme =
    typeof _roundingScheme === 'function' ? new _roundingScheme(tasks, _settings) : _roundingScheme;

  if (typeof _roundingScheme !== 'function') roundingScheme.tasks = tasks;

  return roundingScheme;
}

export function getApproximateDurations<T extends TaskTypeName = TaskTypeName>(
  _roundingScheme: RoundingScheme | ConstructorType<typeof BasicRoundingScheme>,
  settings: BasicSettings,
  tasks: BasicTask<T>[]
): DurationApproximation<T>[] {
  const roundingScheme = getInitializedRoundingScheme<T>(_roundingScheme, settings, tasks);
  return roundingScheme.getApproximateDurations() as DurationApproximation<T>[];
}

export function getApproximateEstimatedDurations<T extends TaskTypeName = TaskTypeName>(
  _roundingScheme: RoundingScheme | ConstructorType<typeof BasicRoundingScheme>,
  settings: BasicSettings,
  tasks: BasicTask<T>[]
): DurationApproximation<T>[] {
  const roundingScheme = getInitializedRoundingScheme<T>(_roundingScheme, settings, tasks);
  return roundingScheme.getApproximateEstimatedDurations() as DurationApproximation<T>[];
}
