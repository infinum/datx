import { customScalar } from './customScalar';
import { plain } from './plain';

export const StringType = plain<string>();

export const NumberType = plain<number>();

export const BooleanType = plain<boolean>();

export const DateType = customScalar<Date, string>(
  (instance) => instance.toISOString(),
  (plain) => new Date(plain),
);
