export enum ParamArrayType {
  MultipleParams, // filter[a]=1&filter[a]=2
  CommaSeparated, // filter[a]=1,2
  ParamArray, // filter[a][]=1&filter[a][]=2
  ObjectPath, // filter[a.0]=1&filter[a.1]=2
}
