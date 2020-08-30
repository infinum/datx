import {
  BaseRequest,
  header,
  parser,
  IResponseObject,
  IFetchOptions,
  serializer,
} from 'datx-network';
import { IJsonapiCollection } from './interfaces/IJsonapiCollection';
import { mapItems } from 'datx-utils';
import { PureModel } from 'datx';
import { modelToJsonApi } from './helpers/model';
import { IJsonapiModel } from './interfaces/IJsonapiModel';
import { Response } from './Response';

function jsonapiParser(data: object, response: IResponseObject): object {
  return (
    (data && response.collection
      ? ((response.collection as unknown) as IJsonapiCollection).sync(data)
      : data) || {}
  );
}

function jsonapiSerializer(request: IFetchOptions): IFetchOptions {
  return {
    ...request,
    data: {
      data:
        mapItems(request.data, (obj) =>
          obj instanceof PureModel ? modelToJsonApi(obj as IJsonapiModel, true) : obj,
        ) || undefined,
    },
  };
}

export function isJsonapi() {
  return (pipeline: BaseRequest): void => {
    pipeline['_config'].Response = Response;
    header('content-type', 'application/vnd.api+json')(pipeline);
    parser(jsonapiParser)(pipeline);
    serializer(jsonapiSerializer)(pipeline);
  };
}

// filter
// sort
// page
// include
// sparse

// transformersInterceptor
