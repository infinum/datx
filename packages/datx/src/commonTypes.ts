import { ICustomScalar } from './interfaces/ICustomScalar';

export const DateType: ICustomScalar<Date, string> = {
  serialize(date: Date): string {
    return date.toISOString();
  },

  parseValue(value: string): Date {
    return new Date(value);
  },
};
