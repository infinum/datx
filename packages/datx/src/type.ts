import { JsonValue } from 'type-fest';
import { ICustomScalar } from './interfaces/ICustomScalar';
import { Date, Json, Pojo, String, Number, Boolean } from './commonTypes';

export function type<TValue, TPlain extends JsonValue>(
  type: ICustomScalar<TValue, TPlain>,
): { innerType: ICustomScalar<TValue, TPlain> } {
  const outerType = { innerType: type };

  return outerType;
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
