import { getModelType } from '@datx/core';
import { appendQueryParams, INetwork, IQueryConfig, ParamArrayType, Request } from '@datx/network';

export function getRequestUrl<TRequestClass extends typeof Request, TNetwork extends INetwork>(
  config: IQueryConfig<TNetwork, TRequestClass>,
): string {
  const base = config.options.baseUrl || '/';
  const endpoint =
    config.refs.modelConstructor['endpoint'] || getModelType(config.refs.modelConstructor);
  const endpointUrl = typeof endpoint === 'function' ? endpoint(base) : `${base}/${endpoint}`;
  const url = config.id ? `${endpointUrl}/${config.id}` : endpointUrl;

  const params = config.match.reduce((acc, curr) => {
    const data = { ...acc };

    Object.keys(curr).forEach((key) => {
      const value = curr[key];
      const dataValue = data[key];
      if (dataValue) {
        data[key] = [...(Array.isArray(dataValue) ? dataValue : [dataValue]), value];
      } else {
        data[key] = value;
      }
    });

    return data;
  }, {});
  return appendQueryParams(
    url,
    params,
    config.options.paramOptions || ParamArrayType.CommaSeparated,
    true,
  );
}
