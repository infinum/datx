export interface IResponseHeaders {
  get(name: string): string | null;
  forEach(cb: (value: string, key: string) => void): void;
}
