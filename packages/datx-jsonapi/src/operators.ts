import {
  BaseRequest,
  header,
  parser,
  IResponseObject,
  IFetchOptions,
  serializer,
  query,
  paramArrayType,
  ParamArrayType,
  encodeQueryString,
} from 'datx-network';
import { IJsonapiCollection } from './interfaces/IJsonapiCollection';
import { mapItems } from 'datx-utils';
import { PureModel } from 'datx';
import { modelToJsonApi } from './helpers/model';
import { IJsonapiModel } from './interfaces/IJsonapiModel';
import { NetworkResponse } from './NetworkResponse';

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
    pipeline['_config'].Response = NetworkResponse;
    header('content-type', 'application/vnd.api+json')(pipeline);
    parser(jsonapiParser)(pipeline);
    serializer(jsonapiSerializer)(pipeline);
    paramArrayType(ParamArrayType.CommaSeparated)(pipeline);
    encodeQueryString(false)(pipeline);
  };
}

export function filter(filter: Record<string, string | object>) {
  return (pipeline: BaseRequest): void => {
    query('filter', filter)(pipeline);
  };
}

export enum Direction {
  Asc = '',
  Desc = '-',
}

export function sort(...params: Array<string | [string, Direction]>) {
  return (pipeline: BaseRequest): void => {
    query(
      'sort',
      params.map((item) => (typeof item === 'string' ? item : item.reverse().join(''))),
    )(pipeline);
  };
}

export function page(page: Record<string, string | object>) {
  return (pipeline: BaseRequest): void => {
    query('page', page)(pipeline);
  };
}

export function include(...included: Array<string>) {
  return (pipeline: BaseRequest): void => {
    query('include', included)(pipeline);
  };
}

export function sparse(sparse: Record<string, Array<string>>) {
  return (pipeline: BaseRequest): void => {
    query('fields', sparse)(pipeline);
  };
}
