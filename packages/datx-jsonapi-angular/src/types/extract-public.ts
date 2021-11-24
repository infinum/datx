export type ExtractPublic<T extends object> = {
  [K in keyof T]: T[K];
};
