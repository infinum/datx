export function mapItems<T, U>(data: T, fn: (item: T) => U): U|null;
export function mapItems<T, U>(data: Array<T>, fn: (item: T) => U): Array<U>;
export function mapItems<T, U>(data: T|Array<T>, fn: (item: T) => U): U|Array<U>|null {
  if (data instanceof Array) {
    return data.map((item) => fn(item));
  }
  return data === null ? null : fn(data);
}
