export interface IFilters {
  [key: string]: number | string | Array<number> | Array<string> | IFilters;
}
