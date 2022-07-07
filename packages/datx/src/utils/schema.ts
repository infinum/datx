import { IPlainResource, IResource } from '../interfaces/IResource';
import { IValidationError } from '../interfaces/IValidationError';
import { IValidationOptions } from '../interfaces/IValidationOptions';
import { TResourceProp } from '../interfaces/TResourceProp';
import { Schema } from '../Schema';
import { mapObjectValues } from './helpers';

export function parseSchema<TSchema extends Schema>(
  schema: TSchema,
  data: IPlainResource<TSchema>,
): IResource<TSchema> {
  return mapObjectValues<TSchema['definition']>(
    schema.definition,
    (
      key: keyof TSchema['definition'],
      def: TSchema['definition'][typeof key],
    ): TResourceProp<typeof def, true> => {
      if ('parseValue' in def) {
        return def.parseValue(data[key as keyof typeof data]) as TResourceProp<typeof def, true>;
      } else if (def instanceof Schema) {
        // @ts-ignore Figure out why this doesn't work here, but othervise it's OK
        return parseSchema(def, data[key as keyof typeof data] as IPlainResource<typeof def>);
      }
      return data[key as keyof typeof data] as TResourceProp<typeof def, true>;
    },
  );
}

export function serializeSchema<TSchema extends Schema>(
  schema: TSchema,
  data: IResource<TSchema>,
): IPlainResource<TSchema> {
  return mapObjectValues<
    TSchema['definition'],
    TResourceProp<TSchema['definition'][keyof TSchema['definition']], false>
  >(
    schema.definition,
    (
      key: keyof TSchema['definition'],
      def: TSchema['definition'][typeof key],
    ): TResourceProp<typeof def, false> => {
      if ('serialize' in def) {
        return def.serialize(data[key as keyof typeof data]) as TResourceProp<typeof def, false>;
      } else if (def instanceof Schema) {
        // @ts-ignore Figure out why this doesn't work here, but othervise it's OK
        return serializeSchema(def, data[key as keyof typeof data] as IResource<typeof def>);
      }
      return data[key as keyof typeof data] as TResourceProp<typeof def, false>;
    },
  );
}

export function validateSchema<TSchema extends Schema>(
  schema: TSchema,
  data: IResource<TSchema>,
  options?: IValidationOptions,
  path = '',
): [boolean, Array<IValidationError>] {
  let dataKeys = Object.keys(data);
  const errors: Array<IValidationError> = [];
  mapObjectValues<TSchema['definition'], void>(
    schema.definition,
    (key: keyof TSchema['definition'], def: TSchema['definition'][typeof key]) => {
      dataKeys = dataKeys.filter((k) => k !== key);

      if (typeof data[key as string] === 'undefined' && !def?.['optional']) {
        errors.push({
          message: `Missing required property ${key as string}`,
          pointer: `${path}${key as string}`,
        });
      } else if (def instanceof Schema) {
        const [valid, subErrors] = validateSchema(
          def,
          data[key as string] as IResource<typeof def>,
          options,
          `${path}${key as string}.`,
        );
        if (!valid) {
          errors.push(...subErrors);
        }
      }
    },
  );

  if (options?.strict) {
    errors.push(
      ...dataKeys.map((key) => ({
        message: `Extra key ${path}${key}`,
        pointer: `${path}${key}`,
      })),
    );
  }

  return [errors.length !== 0, errors];
}
