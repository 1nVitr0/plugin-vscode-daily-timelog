import { defaultOptions, parse } from 'yaml';
import { yamlCustomTags } from '../../../../shared/out';

defaultOptions.customTags = yamlCustomTags;

export function parseYaml(document: string): any {
  return parse(document);
}
