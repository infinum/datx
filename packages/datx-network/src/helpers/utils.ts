import { ParamArrayType } from '../enums/ParamArrayType';
import { PureModel, IFieldDefinition, IReferenceDefinition } from 'datx';
import { getMeta } from 'datx-utils';

export const isBrowser: boolean = typeof window !== 'undefined';

export function deepCopy<T extends object>(inObject: T): T {
  let value: any;
  let key: string | number | symbol;

  if (typeof inObject !== 'object' || inObject === null) {
    return inObject; // Return the value if inObject is not an object
  }

  // Create an array or object to hold the values
  const outObject: object = Array.isArray(inObject) ? [] : {};

  for (key in inObject) {
    value = inObject[key];

    // Recursively (deep) copy for nested objects, including arrays
    outObject[key] = deepCopy(value);
  }

  return outObject as T;
}

const interpolationRegex = /\{\s*([a-zA-Z0-9\-_]+)\s*\}/g;

export function interpolateParams(url: string, params: Record<string, string>): string {
  let newUrl = url;
  let match = interpolationRegex.exec(newUrl);
  let lastIndex = 0;
  while (match) {
    let param = params[match[1]];
    if (param === undefined) {
      param = match[0];
      lastIndex = interpolationRegex.lastIndex;
    }
    newUrl = newUrl.replace(match[0], param);
    interpolationRegex.lastIndex = lastIndex;
    match = interpolationRegex.exec(newUrl);
  }
  return newUrl;
}

function parametrize(
  paramArrayType: ParamArrayType,
  params: object,
  scope = '',
): Array<{ key: string; value: string }> {
  const list: Array<{ key: string; value: string }> = [];

  Object.keys(params).forEach((key) => {
    if (params[key] instanceof Array) {
      if (paramArrayType === ParamArrayType.ObjectPath) {
        // eslint-disable-next-line prefer-spread
        list.push.apply(list, parametrize(paramArrayType, params[key], `${key}.`));
      } else if (paramArrayType === ParamArrayType.CommaSeparated) {
        list.push({ key: `${scope}${key}`, value: params[key].join(',') });
      } else if (paramArrayType === ParamArrayType.MultipleParams) {
        // eslint-disable-next-line prefer-spread
        list.push.apply(
          list,
          params[key].map((param) => ({ key: `${scope}${key}`, value: param })),
        );
      } else if (paramArrayType === ParamArrayType.ParamArray) {
        // eslint-disable-next-line prefer-spread
        list.push.apply(
          list,
          params[key].map((param) => ({ key: `${scope}${key}][`, value: param })),
        );
      }
    } else if (typeof params[key] === 'object') {
      // eslint-disable-next-line prefer-spread
      list.push.apply(list, parametrize(paramArrayType, params[key], `${key}.`));
    } else {
      list.push({ key: `${scope}${key}`, value: params[key] });
    }
  });

  return list;
}

function appendParams(url: string, params: Array<string>): string {
  let newUrl = url;

  if (params.length) {
    const separator = newUrl.indexOf('?') === -1 ? '?' : '&';

    newUrl += separator + params.join('&');
  }

  return newUrl;
}

export function appendQueryParams(
  url: string,
  query: Record<string, string | Array<string> | object>,
  paramArrayType: ParamArrayType,
  encodeQueryString: boolean,
): string {
  const processedParams = parametrize(paramArrayType, query)
    .map(({ key, value }) => ({
      key,
      value: encodeQueryString ? encodeURIComponent(value) : value,
    }))
    .map(({ key, value }) => `${key}=${value}`);

  return appendParams(url, processedParams);
}

export function getModelClassRefs(
  type: typeof PureModel | PureModel,
): Record<string, IReferenceDefinition> {
  const fields: Record<string, IFieldDefinition> = getMeta(type, 'fields', {}, true, true);
  const refs: Record<string, IReferenceDefinition> = {};

  Object.keys(fields).forEach((key) => {
    if (fields[key].referenceDef) {
      refs[key] = fields[key].referenceDef as IReferenceDefinition;
    }
  });

  return refs;
}
