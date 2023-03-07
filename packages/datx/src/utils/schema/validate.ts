import { IInnerType } from '../../interfaces/IInnerType';
import { IResource } from '../../interfaces/IResource';
import { IValidationError } from '../../interfaces/IValidationError';
import { IValidationOptions } from '../../interfaces/IValidationOptions';
import { Schema } from '../../Schema';
import { mapObjectValues } from '../helpers';

export function validatePlainSchema<TSchema extends Schema>(
  schema: TSchema,
  data: IResource<TSchema, true>,
  options?: IValidationOptions,
  path = '',
): [boolean, Array<IValidationError>] {
  return validateSchema(
    schema,
    // Some cheating to avoid a mess of types
    data as unknown as IResource<TSchema>,
    { ...options, plain: true },
    path,
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

      const typeObj =
        'type' in def && !(def instanceof Schema)
          ? (def as IInnerType<any>)
          : ({ type: def, optional: def?.['optional'] ?? false } as IInnerType<typeof def>);

      const type = typeObj.type;
      const optional = typeObj?.['optional'] ?? false;
      const value = data[key as keyof IResource<TSchema>];

      if (typeof value === 'undefined' && !optional) {
        errors.push({
          message: `Missing required property ${key as string}`,
          pointer: `${path}${key as string}`,
        });
      } else if (type instanceof Schema) {
        const [hasErrors, subErrors] = validateSchema(
          type,
          value as IResource<typeof type>,
          options,
          `${path}${key as string}.`,
        );

        if (hasErrors) {
          errors.push(...subErrors);
        }
      } else if (typeof type === 'function') {
        if (value !== type(value)) {
          if (typeof value === 'undefined' && optional) {
            return;
          }
          errors.push({
            message: `Wrong property type for ${key as string}`,
            pointer: `${path}${key as string}`,
          });
        }
      } else if ('parseValue' in def) {
        if (typeof value === 'undefined' && optional) {
          return;
        }
        try {
          if (options?.plain) {
            const clone = def.serialize(def.parseValue(value, key as string | number, data));

            if (value !== clone) {
              errors.push({
                message: `Wrong property type for ${key as string}`,
                pointer: `${path}${key as string}`,
              });
            }
          } else {
            let correctType = false;
            if (def.test) {
              correctType = def.test(value);
            } else if (def instanceof Schema) {
              correctType = (value as unknown) instanceof def.constructor;
            } else {
              correctType = (value as unknown) instanceof (def as any);
            }

            if (!correctType) {
              console.log(value, typeof value, key);
              errors.push({
                message: `Wrong property type for ${key as string}`,
                pointer: `${path}${key as string}`,
              });
            }
          }
        } catch (e) {
          errors.push({
            message: `Wrong property type for ${key as string}`,
            pointer: `${path}${key as string}`,
          });
        }
      }
    },
  );

  if (options?.strict) {
    errors.push(
      ...dataKeys.map((key) => ({
        message: `Extra key ${path}${key} found`,
        pointer: `${path}${key}`,
      })),
    );
  }

  if (options?.throw && errors.length > 0) {
    throw new Error(errors[0].message);
  }

  return [errors.length !== 0, errors];
}
