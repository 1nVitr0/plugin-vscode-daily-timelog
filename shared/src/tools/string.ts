import { CustomParams, ParamType } from '../model/Summary/Params';

export type StructuredParams<T> = { [P in keyof T]: string | number | boolean | StructuredParams<T[P]> };

export function isStructuredParams(params: any): params is StructuredParams<any> {
  return typeof params === 'object';
}

export function formatList(format: string, list: string[]): string {
  return list.map((value, index) => formatString(format, { value, index, nextIndex: index + 1 })).join('\n');
}

export function formatCustomParams(
  paramValues: { [P: string]: string | string[] },
  paramSettings: CustomParams[]
): { [P: string]: string } {
  const result: { [P: string]: string } = {};

  for (const { name, template, type } of paramSettings) {
    switch (type) {
      case ParamType.Array:
        result[name] = formatList(
          template || '{{value}}',
          (name in paramValues ? paramValues[name] || [] : []) as string[]
        );
        break;
      default:
        result[name] = formatString(template || '{{value}}', { value: name in paramValues ? paramValues[name] : '' });
    }
  }

  return result;
}

function traverseParamTree<T>(paramTree: (keyof T)[], params: StructuredParams<T>): string | number | boolean | null {
  const node = [...paramTree].shift();
  if (!node) return null; // should not happen

  const param = params[node];

  if (params[node] == undefined) return null;
  if (isStructuredParams(param) && paramTree.length >= 1) return traverseParamTree(paramTree.slice(1), param);
  return ['number', 'string', 'boolean'].includes(typeof param)
    ? (param as string | number | boolean)
    : param.toString();
}

export function formatString<T>(
  format: string,
  params: T extends StructuredParams<infer R> ? StructuredParams<R> : any
): string {
  return format
    .replace(/{{(.+?)}}([^{]*\?)?/g, (_, g1, g2) => {
      const param: string = g1.trim();
      const paramTree = param.split('.');
      const optional: string = g2 ? g2.slice(0, -1) : null;
      const paramValue = traverseParamTree(paramTree, params);

      if (optional) return paramValue ? `${paramValue}${optional}` : '';

      return paramValue === null ? param : paramValue.toString();
    })
    .trim();
}

export function parseString<T>(string: string, format: string): { [key: string]: string | undefined | null } {
  const params: { [key: string]: string | undefined | null } = {};
  const keys: string[] = [];
  const regex = format
    .replace(/{{(.+?)}}([^{?]*)?(\?)?/g, (_, g1, g2, g3) => {
      keys.push(g1.trim());
      return `((.+?)${g2 || '$'})${g3 ? '?' : ''}`;
    })
    .replace(/\s+/, '\\s*');
  const matches = string.match(new RegExp(regex));

  for (let i = 2; i < (matches?.length || 0); i += 2) params[keys[(i - 2) / 2]] = matches ? matches[i] : null;

  return params;
}

export function isBreak(breakName?: string): boolean {
  return !!breakName && /^\[.*\]$/.test(breakName);
}

export function extractBreak(breakName: string): string {
  return breakName.replace(/^\[(.*)\]$/, (_, name) => name);
}
