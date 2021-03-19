import { template, TemplateSettings } from 'lodash';
import { CustomParams, ParamType } from '../model/Settings/Params';

const templateSettings: TemplateSettings = {
  evaluate: /{{([\s\S]+?)}}/g,
  interpolate: /{{([\s\S]+?)}}/g,
  escape: /{{-([\s\S]+?)}}/g,
};

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

export function formatString<T>(
  format: string,
  params: T extends StructuredParams<infer R> ? StructuredParams<R> : any
): string {
  const builder = template(format, templateSettings);
  return builder(params);
}

export function isBreak(breakName?: string): boolean {
  return !!breakName && /^\[.*\]$/.test(breakName);
}

export function extractBreak(breakName: string): string {
  return breakName.replace(/^\[(.*)\]$/, (_, name) => name);
}
