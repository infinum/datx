import { IConfigType } from './interfaces/IConfigType';
import { ParamArrayType } from './enums/ParamArrayType';
import { mapItems } from '@datx/utils';
import { PureModel, modelToJSON } from '@datx/core';
import { IFetchOptions } from './interfaces/IFetchOptions';
import { Response } from './Response';

export function getDefaultConfig(): IConfigType {
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
