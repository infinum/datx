import { modelToJSON, PureModel } from '@datx/core';
import { mapItems } from '@datx/utils';
import { ParamArrayType } from './enums/ParamArrayType';
import { IConfigType } from './interfaces/IConfigType';
import { IFetchOptions } from './interfaces/IFetchOptions';
import { Response } from './Response';

export function getDefaultConfig(): Omit<IConfigType, 'network'> {
  return {
    // Base URL for all API calls
    baseUrl: '/',

    encodeQueryString: true,

    // Determines how will the request param arrays be stringified
    paramArrayType: ParamArrayType.ParamArray,

    serialize: (request: IFetchOptions): IFetchOptions => {
      return {
        ...request,
        data:
          mapItems(request.data, (obj) => (obj instanceof PureModel ? modelToJSON(obj) : obj)) ||
          undefined,
      };
    },

    Response,
  };
}
