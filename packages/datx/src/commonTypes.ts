import { JsonValue } from 'type-fest';
import { ICustomScalar } from './interfaces/ICustomScalar';

export const Date: ICustomScalar<Date, string> = {
  serialize(date: Date): string {
    return date.toISOString();
  },

  parseValue(value: string): Date {
    return new globalThis.Date(value);
  },
  test: (item: unknown): item is Date => item instanceof globalThis.Date,
};

export const Json: ICustomScalar<object, string> = {
  serialize(data: object): string {
    return JSON.stringify(data);
  },

  parseValue(value: string): object {
    return JSON.parse(value);
  },
  test: (item: unknown): item is object => typeof item === 'object' && item !== null,
};

export const Pojo: ICustomScalar<JsonValue, JsonValue> = {
  serialize(data: JsonValue): JsonValue {
    return data;
  },
  parseValue(value: JsonValue): JsonValue {
    return value;
  },
  test: (item: unknown): item is JsonValue => typeof item !== 'function',
};

export const String: ICustomScalar<string, string> = {
  serialize(data: string): string {
    return data;
  },
  parseValue(value: string): string {
    return value;
  },
  test: (item: unknown): item is string => typeof item === 'string',
};

export const Number: ICustomScalar<number, number> = {
  serialize(data: number): number {
    return data;
  },
  parseValue(value: number): number {
    return value;
  },
  test: (item: unknown): item is number => typeof item === 'number',
};

export const Boolean: ICustomScalar<boolean, boolean> = {
  serialize(data: boolean): boolean {
    return data;
  },
  parseValue(value: boolean): boolean {
    return value;
  },
  test: (item: unknown): item is boolean => typeof item === 'boolean',
};
