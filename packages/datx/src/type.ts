import { JsonValue } from 'type-fest';
import { ICustomScalar } from './interfaces/ICustomScalar';
import {
  Date as CommonDate,
  Json as CommonJson,
  Pojo as CommonPojo,
  String as CommonString,
  Number as CommonNumber,
  Boolean as CommonBoolean,
  ArrayOf as CommonArrayOf,
} from './commonTypes';
import { IOuterType } from './interfaces/IOuterType';
import { Schema } from '.';

export function type<TValue, TPlain extends JsonValue>(
  scalarType: ICustomScalar<TValue, TPlain> | Schema,
  optional = false,
  defaultValue?: TValue,
): IOuterType<ICustomScalar<TValue, TPlain> | Schema> {
  return {
    type: {
      type: scalarType,
      optional,
      defaultValue,
    },
    optional(defaultValue?: TValue) {
      return type(scalarType, true, defaultValue);
    },
  };
}

export const Date = type(CommonDate);

export const Json = type(CommonJson);

export const Pojo = type(CommonPojo);

export const String = type(CommonString);

export const Number = type(CommonNumber);

export const Boolean = type(CommonBoolean);

export const ArrayOf = type(CommonArrayOf);

// type.oneOf = function oneOf<TValue, TPlain extends JsonValue>(
//   ...types: Array<ICustomScalar<TValue, TPlain>>,
// ): { innerType: ICustomScalar<TValue, TPlain> } {
//   const outerType = { innerType: [types] };

//   return outerType;
// }

// export const ArrayOf = function arrayOf<TValue, TPlain extends JsonValue>(
//   type: ICustomScalar<TValue, TPlain> | Schema,
// ) {
//   const outerType = { innerType: [type], type: 'arrayOf', optional: false };

//   return outerType;
// };
