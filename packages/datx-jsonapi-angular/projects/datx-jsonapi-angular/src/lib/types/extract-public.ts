// TODO: replace with ExtractPublic from @infinum/ngx-nuts-and-bolts
export type ExtractPublic<T extends object> = {
  [K in keyof T]: T[K];
};
