import { Alias, Collection, Merge, Pair, Scalar, YAMLMap, YAMLSeq } from 'yaml/types';

export enum YamlType {
  Key = 'KEY',
  EmptyKey = 'EMPTY_KEY',
  Value = 'VALUE',
  EmptyValue = 'EMPTY_VALUE',
  None = 'NONE',
}
export type YamlNode = Scalar | Alias | Pair | Merge | Collection | YAMLMap | YAMLSeq;
export type YamlNodeDescriptor = {
  type: YamlType;
  context: (Scalar | null)[];
  node?: Scalar | null;
};

export type YamlKeyDEscriptor = YamlNodeDescriptor & { type: YamlType.Key };
export type YamlValueDescriptor = YamlNodeDescriptor & { type: YamlType.Value };
