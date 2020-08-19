import { IConfigType } from './interfaces/IConfigType';
import { ParamArrayType } from './enums/ParamArrayType';
import { isBrowser } from './helpers/utils';

export function getDefaultConfig(): IConfigType {
  return {
    // Base URL for all API calls
    baseUrl: '/',

    encodeQueryString: true,

    // Determines how will the request param arrays be stringified
    paramArrayType: ParamArrayType.ParamArray,

    fetchReference: isBrowser ? window.fetch?.bind?.(window) : undefined,
  };
}
