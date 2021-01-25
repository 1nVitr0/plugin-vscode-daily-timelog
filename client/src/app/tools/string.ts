export type StructuredParams<T> = { [P in keyof T]: string | number | boolean | StructuredParams<T[P]> };

export function isStructuredParams(params: any): params is StructuredParams<any> {
  return typeof params === 'object';
}

function traverseParamTree<T>(paramTree: (keyof T)[], params: StructuredParams<T>): string | null {
  const node = paramTree.shift();
  if (!node) return null; // should not happen

  const param = params[node];

  if (!params[node]) return null;
  if (isStructuredParams(param) && paramTree.length > 1) return traverseParamTree(paramTree.slice(1), param);
  return params[node].toString();
}

export function formatString<T>(
  string: string,
  params: T extends StructuredParams<infer R> ? StructuredParams<R> : any
): string {
  return string
    .replace(/{{(.+?)}}([^{]*\?)?/g, (_, g1, g2) => {
      const param: string = g1.trim();
      const paramTree = param.split('.');
      const optional: string = g2 ? g2.slice(0, -1) : null;
      const paramValue = traverseParamTree(paramTree, params);

      if (optional) return paramValue ? `${paramValue}${optional}` : '';

      return paramValue === null ? param : paramValue;
    })
    .trim();
}
