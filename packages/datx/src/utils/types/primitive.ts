import { customScalar } from './customScalar';
import { plain } from './plain';

export const StringType = plain<string>('string');

export const NumberType = plain<number>('number');

export const BooleanType = plain<boolean>('boolean');

export const DateType = customScalar<Date, string>(
  (instance) => instance.toISOString(),
  (plain) => new Date(plain),
  (item): item is Date => item instanceof Date,
  (item): item is string => typeof item === 'string' && !isNaN(Date.parse(item)),
);
