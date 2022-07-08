import { IResource } from '../../interfaces/IResource';
import { IValidationError } from '../../interfaces/IValidationError';
import { IValidationOptions } from '../../interfaces/IValidationOptions';
import { Schema } from '../../Schema';
import { mapObjectValues } from '../helpers';

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

      const type = def instanceof Schema ? def : def?.['type'] ?? def;
      const optional = def?.['optional'] ?? false;

      if (typeof data[key as string] === 'undefined' && !optional) {
        errors.push({
          message: `Missing required property ${key as string}`,
          pointer: `${path}${key as string}`,
        });
      } else if (type instanceof Schema) {
        const [hasErrors, subErrors] = validateSchema(
          type,
          data[key as string] as IResource<typeof type>,
          options,
          `${path}${key as string}.`,
        );

        if (hasErrors) {
          errors.push(...subErrors);
        }
      } else if (typeof type === 'function') {
        if (data[key as string] !== type(data[key as string])) {
          if (typeof data[key as string] === 'undefined' && optional) {
            return;
          }
          errors.push({
            message: `Wrong property type for ${key as string}`,
            pointer: `${path}${key as string}`,
          });
        }
      } else if (def?.['parseValue']) {
        if (typeof data[key as string] === 'undefined' && optional) {
          return;
        }
        try {
          const clone = def?.['parseValue'](def?.['serialize'](data[key as string]));
          const constructor = clone.constructor;
          if (!(data[key as string] instanceof constructor)) {
            errors.push({
              message: `Wrong custom instance type for ${key as string}`,
              pointer: `${path}${key as string}`,
            });
          }
        } catch (e) {
          errors.push({
            message: `Wrong custom property type for ${key as string}`,
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
