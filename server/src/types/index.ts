import { Alias, Collection, Merge, Pair, Scalar, YAMLMap, YAMLSeq } from 'yaml/types';

export enum SimpleYamlType {
  Key = 'KEY',
  Value = 'VALUE',
}
export type YamlNode = Scalar | Alias | Pair | Merge | Collection | YAMLMap | YAMLSeq;
export type SimpleYamlNode = {
  type: SimpleYamlType;
  context: Scalar[];
  node: Scalar;
};

export type SimpleYamlKey = SimpleYamlNode & { type: SimpleYamlType.Key };
export type SimpleYamlValue = SimpleYamlNode & { type: SimpleYamlType.Value };
