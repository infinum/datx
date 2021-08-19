export interface IFilters {
  [key: string]: string | Array<string> | IFilters;
}
