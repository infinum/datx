import { ParamArrayType } from '../enums/ParamArrayType';

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

export function parametrize(
  params: Record<string, unknown>,
  paramArrayType: ParamArrayType,
  scope = '',
): Array<{ key: string; value: string }> {
  const list: Array<{ key: string; value: string }> = [];

  Object.keys(params).forEach((key) => {
    const scoped = `${scope}${scope ? `[${key}]` : key}`;
    const value = params[key];
    if (value instanceof Array) {
      if (paramArrayType === ParamArrayType.CommaSeparated) {
        list.push({ key: scoped, value: value.join(',') });
      } else if (paramArrayType === ParamArrayType.MultipleParams) {
        list.push(...value.map((param: string) => ({ key: scoped, value: String(param) })));
      } else if (paramArrayType === ParamArrayType.ParamArray) {
        list.push(
          ...value.map((param: string) => ({
            key: `${scoped}[]`,
            value: String(param),
          })),
        );
      }
    } else if (typeof value === 'object' && value !== null) {
      list.push(...parametrize(value as Record<string, unknown>, paramArrayType, scoped));
    } else if (value !== undefined) {
      list.push({ key: scoped, value: String(value) });
    }
  });

  return list;
}

function appendParams(url: string, params: Array<string>): string {
  let newUrl = url;

  if (params.length) {
    let separator = '';
    if (newUrl.indexOf('?') === -1) {
      separator = '?';
    } else if (!newUrl.endsWith('&') && !newUrl.endsWith('?')) {
      separator = '&';
    }

    newUrl += separator + params.join('&');
  }

  return newUrl;
}

export function appendQueryParams(
  url: string,
  query: Record<string, unknown>,
  paramArrayType: ParamArrayType,
  encodeQueryString: boolean,
): string {
  const processedParams = parametrize(query, paramArrayType)
    .map(({ key, value }) => ({
      key,
      value: encodeQueryString ? encodeURIComponent(value) : value,
    }))
    .map(({ key, value }) => `${key}=${value}`);

  return appendParams(url, processedParams);
}
