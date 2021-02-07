import { defaultOptions, parse } from 'yaml';
import { yamlCustomTags } from '../../../../shared/out';

defaultOptions.customTags = yamlCustomTags;

export function parseYaml(...args: Parameters<typeof parse>): any {
  return parse(...args);
}
