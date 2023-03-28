export const isFunction = (value: any): value is Function => typeof value == 'function';

export const undefinedToNull = <TProps>(props: TProps): TProps =>
  JSON.parse(JSON.stringify(props)) as TProps;
