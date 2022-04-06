import { ICollectionConstructor, PureCollection } from "@datx/core";
import { IJsonapiCollection, IJsonapiModel, IRawResponse, jsonapiCollection, Response } from "@datx/jsonapi";
import { unstable_serialize } from "swr";
import { createFetcher } from "./createFetcher";
import { Expression } from "./interfaces/QueryExpression";

export interface IJsonapiSwrClient {
  fetchQuery<TModel extends IJsonapiModel = IJsonapiModel>(expression: Expression): Promise<{ data: Response<TModel>} >;
  fallback: Record<string, IRawResponse>;
}

export type JsonapiSwrClientReturn = ICollectionConstructor<PureCollection & IJsonapiCollection & IJsonapiSwrClient>;

export function jsonapiSwrClient(BaseClass: typeof PureCollection): JsonapiSwrClientReturn {
   class JsonapiSwrClient extends jsonapiCollection(BaseClass) implements IJsonapiSwrClient {
    private __fallback: Record<string, unknown> = {};

    public async fetchQuery<TModel extends IJsonapiModel = IJsonapiModel>(expression: Expression) {
      try {
        const fetcher = createFetcher(this);
        const response = await fetcher<TModel>(expression);
        const key = unstable_serialize(expression);
        const rawResponse = response['__internal'].response as IRawResponse;
        delete rawResponse.collection;
        this.__fallback[key] = rawResponse;

        return {
          data: response,
        };
      } catch (error) {
        if (error instanceof Response) {
          throw error.error;
        }

        throw error;
      }
    }

    public get fallback() {
      return JSON.parse(JSON.stringify(this.__fallback));
    }
  }

  return (JsonapiSwrClient as unknown) as JsonapiSwrClientReturn;
}

