export function mapObjectValues<T>(
  obj: T,
  fn: <TReturn>(key: keyof T, value: typeof obj[typeof key]) => TReturn,
) {
  const entries = (Object.entries(obj) as Array<[keyof T, typeof obj[keyof T]]>).map(
    ([key, value]) => [key, fn(key, value)],
  );
  return Object.fromEntries(entries);
}
