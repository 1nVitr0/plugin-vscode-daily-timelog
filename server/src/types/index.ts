import { Alias, Collection, Merge, Pair, Scalar, YAMLMap, YAMLSeq } from 'yaml/types';

export enum YamlType {
  Key = 'KEY',
  EmptyKey = 'EMPTY_KEY',
  Value = 'VALUE',
  EmptyValue = 'EMPTY_VALUE',
  Single = 'SINGLE',
  None = 'NONE',
}
export type YamlNode = Scalar | Alias | Pair | Merge | Collection | YAMLMap | YAMLSeq;
export interface YamlNodeDescriptor {
  context: (Scalar | null)[];
  node?: Scalar | null;
  type: YamlType;
}

export type YamlKeyDescriptor = YamlNodeDescriptor & { type: YamlType.Key | YamlType.Single };
export type YamlValueDescriptor = YamlNodeDescriptor & { type: YamlType.Value | YamlType.Single };
export type YamlSingleDescriptor = YamlNodeDescriptor & { type: YamlType.Single };
