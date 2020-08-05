export enum ParamArrayType {
  MULTIPLE_PARAMS, // filter[a]=1&filter[a]=2
  COMMA_SEPARATED, // filter[a]=1,2
  PARAM_ARRAY, // filter[a][]=1&filter[a][]=2
  OBJECT_PATH, // filter[a.0]=1&filter[a.1]=2
}
