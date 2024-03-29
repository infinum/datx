import { Collection, IFieldDefinition, IReferenceDefinition, PureModel, View } from '@datx/core';
import { getMeta } from '@datx/utils';
import { DATX_JSONAPI_CLASS } from '../consts';
import { IGetAllResponse } from '../interfaces/IGetAllResponse';
import { IJsonapiModel } from '../interfaces/IJsonapiModel';
import { Response } from '../Response';

// eslint-disable-next-line no-var
declare var window: object;

export const isBrowser: boolean = typeof window !== 'undefined';

/**
 * Returns the value if it's not a function. If it's a function
 * it calls it.
 *
 * @export
 * @template T
 * @param {(T|(() => T))} target can be  anything or function
 * @returns {T} value
 */
export function getValue<T>(target: T | (() => T)): T {
  if (typeof target === 'function') {
    // @ts-ignore
    return target();
  }

  return target;
}

export function error(message: string): Error {
  return new Error(`[datx exception] ${message}`);
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

export async function getAllResponses<M extends IJsonapiModel = IJsonapiModel>(
  response: Response<M>,
  maxRequests = 50,
): Promise<IGetAllResponse<M>> {
  const data: Array<M> = [];
  const responses: Array<Response<M>> = [];
  let lastResponse = response;
  let requests = 1;

  data.push(...(response.data as Array<M>));
  responses.push(response);

  while (response.next) {
    requests++;

    if (requests > maxRequests) {
      break;
    }
    response = await response.next();
    responses.push(response);
    data.push(...(response.data as Array<M>));
  }

  lastResponse = responses[responses.length - 1];

  return {
    data,
    responses,
    lastResponse,
  };
}

export function isJsonApiClass(type: typeof PureModel | typeof Collection | typeof View): boolean {
  return DATX_JSONAPI_CLASS in type;
}
