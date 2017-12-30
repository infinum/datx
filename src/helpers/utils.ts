export function mapItems<T, U>(data: T, fn: (item: T) => U): U|null;
export function mapItems<T, U>(data: Array<T>, fn: (item: T) => U): Array<U>;
export function mapItems<T, U>(data: T|Array<T>, fn: (item: T) => U): U|Array<U>|null {
  if (data instanceof Array) {
    return data.map((item) => fn(item));
  }
  return data === null ? null : fn(data);
}

export function flatten<T>(data: Array<Array<T>>): Array<T> {
  return ([] as Array<T>).concat(...data);
}

export function uniq<T>(data: Array<T>): Array<T> {
  return Array.from(new Set(data));
}

export function isFalsyArray(value): boolean {
  return value instanceof Array && !value.every(Boolean);
}
