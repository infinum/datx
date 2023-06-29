import { JsonValue } from 'type-fest';
import { ICustomScalar } from './interfaces/ICustomScalar';
import { Date, Json, Pojo, String, Number, Boolean } from './commonTypes';
import { IOuterType } from './interfaces/IOuterType';

export function type<TValue, TPlain extends JsonValue>(
  scalarType: ICustomScalar<TValue, TPlain>,
  optional = false,
  defaultValue?: TValue,
): IOuterType<ICustomScalar<TValue, TPlain>> {
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

type.Date = type(Date);
type.Json = type(Json);
type.Pojo = type(Pojo);
type.String = type(String);
type.Number = type(Number);
type.Boolean = type(Boolean);

// type.oneOf = function oneOf<TValue, TPlain extends JsonValue>(
//   ...types: Array<ICustomScalar<TValue, TPlain>>,
// ): { innerType: ICustomScalar<TValue, TPlain> } {
//   const outerType = { innerType: [types] };

//   return outerType;
// }

// type.arrayOf = function arrayOf<TValue, TPlain extends JsonValue>(
//   type: ICustomScalar<TValue, TPlain>,
// ): { innerType: ICustomScalar<TValue, TPlain> } {
//   const outerType = { innerType: [type] };

//   return outerType;
// }
