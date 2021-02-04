import { validateDate } from './time';

export function allKeys<T>(dummy: Record<keyof T, any>): (keyof Required<T>)[] {
  return Object.keys(dummy) as (keyof Required<T>)[];
}

export function isKeyOf<T>(key: string | number | symbol, object: Record<keyof T, any>): key is keyof Required<T> {
  const validKeys = allKeys<T>(object);
  // @ts-ignore
  return validKeys.includes(key);
}
