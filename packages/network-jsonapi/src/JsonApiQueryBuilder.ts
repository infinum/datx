import { PureModel } from '@datx/core';
import {
  INetwork,
  QueryBuilder,
  IRequestDetails,
  Request,
  isModelPersisted,
  IQueryConfig,
  IResponseSnapshot,
  ISubrequest,
} from '@datx/network';
import { getMeta, mapItems } from '@datx/utils';
import { parseModel, getModelRefLinks, modelToJsonApi } from './helpers/model';
import { getRequestUrl } from './helpers/url';
import { IFilters } from './interfaces/IFilters';
import { IRecord, IResponse } from './interfaces/JsonApi';

export class JsonApiQueryBuilder<
  TResponse extends TModelInstance | Array<TModelInstance | unknown> | unknown,
  TRequestClass extends typeof Request,
  TNetwork extends INetwork,
  TModelClass extends typeof PureModel = typeof PureModel,
  TModelInstance extends
    | (InstanceType<TModelClass> & PureModel)
    | unknown = InstanceType<TModelClass>,
> extends QueryBuilder<TResponse, TRequestClass, TNetwork, TModelClass, TModelInstance> {
  public constructor(public readonly config: IQueryConfig<TNetwork, TRequestClass>) {
    super(config);
    if (config.headers) {
      this.config.headers = {
        'Content-Type': 'application/vnd.api+json',
        ...this.config.headers,
      };
    }

    this.parser = (response: IResponseSnapshot) => {
      const data = response.response.data as IResponse | null;
      if (data && data.data) {
        const mainData = ([] as Array<IRecord>).concat(data.data);
        const includedData = data.included || [];
        const classRefs = {};
        const models = [...mainData, ...includedData].map(parseModel(classRefs));
        return {
          ...response,
          response: {
            ...response.response,
            data: models,
          },
        } as IResponseSnapshot;
      }
      return response;
    };
  }

  // build method is a custom implementation that, generates an generic IRequestDetails object with all data required for the API call
  public build(): IRequestDetails {
    return {
      url: getRequestUrl(this.config),
      method: this.config.method || 'GET',
      headers: this.config.headers,
      body: null,
      cachingKey: `${this.config.refs.modelConstructor.type}/${
        this.config.id ? this.config.id : JSON.stringify(this.config.match)
      }`,
    };
  }

  private get model(): TModelInstance | null {
    return (
      (this.config.id &&
        (this.config.refs.collection?.findOne(
          this.config.refs.modelConstructor,
          this.config.id,
        ) as TModelInstance)) ||
      null
    );
  }

  private persist(
    data: Record<string, unknown>,
  ): QueryBuilder<TResponse, TRequestClass, TNetwork, TModelClass, TModelInstance> {
    if (!this.model) {
      throw new Error('Model was not found');
    }
    const isPersisted = isModelPersisted(this.model as PureModel);
    return this.extend({
      method: isPersisted ? 'PATCH' : 'POST',
      body: data,
    }) as QueryBuilder<TResponse, TRequestClass, TNetwork, TModelClass, TModelInstance>;
  }

  public save(): QueryBuilder<TResponse, TRequestClass, TNetwork, TModelClass, TModelInstance> {
    if (!this.model) {
      throw new Error('Model was not found');
    }
    return this.persist(
      modelToJsonApi(this.model as PureModel, true) as unknown as Record<string, unknown>,
    ) as QueryBuilder<TResponse, TRequestClass, TNetwork, TModelClass, TModelInstance>;
  }

  public update(
    data: Partial<TModelInstance>,
  ): QueryBuilder<TResponse, TRequestClass, TNetwork, TModelClass, TModelInstance> {
    return this.persist(data) as QueryBuilder<
      TResponse,
      TRequestClass,
      TNetwork,
      TModelClass,
      TModelInstance
    >;
  }

  public delete(): QueryBuilder<TResponse, TRequestClass, TNetwork, TModelClass, TModelInstance> {
    return this.extend({ method: 'DELETE' }) as QueryBuilder<
      TResponse,
      TRequestClass,
      TNetwork,
      TModelClass,
      TModelInstance
    >;
  }

  public filter(
    filter: IFilters,
  ): QueryBuilder<TResponse, TRequestClass, TNetwork, TModelClass, TModelInstance> {
    return this.extend({
      match: [...this.config.match, { filter }],
    }) as QueryBuilder<TResponse, TRequestClass, TNetwork, TModelClass, TModelInstance>;
  }

  public sort(
    sortField: string,
    direction: 'asc' | 'desc' = 'asc',
  ): QueryBuilder<TResponse, TRequestClass, TNetwork, TModelClass, TModelInstance> {
    return this.extend({
      match: [...this.config.match, { sort: direction === 'asc' ? sortField : `-${sortField}` }],
    }) as QueryBuilder<TResponse, TRequestClass, TNetwork, TModelClass, TModelInstance>;
  }

  public fields(
    fieldList: Array<string> | Record<string, Array<string>>,
  ): QueryBuilder<TResponse, TRequestClass, TNetwork, TModelClass, TModelInstance> {
    const fields = Array.isArray(fieldList)
      ? { [this.config.refs.modelConstructor.type]: fieldList }
      : fieldList;
    return this.extend({
      match: [...this.config.match, { fields }],
    }) as QueryBuilder<TResponse, TRequestClass, TNetwork, TModelClass, TModelInstance>;
  }

  public pagination(
    options: Record<string, string>,
  ): QueryBuilder<TResponse, TRequestClass, TNetwork, TModelClass, TModelInstance> {
    return this.extend({
      match: [...this.config.match, { page: options }],
    }) as QueryBuilder<TResponse, TRequestClass, TNetwork, TModelClass, TModelInstance>;
  }

  public include(
    keys: string | Array<string>,
    chained = false,
  ): QueryBuilder<TResponse, TRequestClass, TNetwork, TModelClass, TModelInstance> {
    if (chained) {
      const chain = ([] as Array<string>)
        .concat(keys)
        .map((key) => {
          if (key.includes('.')) {
            throw new Error('Nested include is not yet supported in the chained mode');
          }

          // TODO: This is error prone if the model is not yet added into the collection
          // Add some error handling or a way to pass the model manually
          const type = getMeta(this.config.refs.modelConstructor, 'fields', {}, true, true)[key]
            .type;
          const ModelClass =
            this.config.refs.collection?.find((item: typeof PureModel) => item.type === type) ||
            PureModel;
          return (client, response) => {
            return mapItems(response.data, (item) => {
              return {
                request: client
                  .from(ModelClass)
                  .request(getModelRefLinks(item)[key])
                  .buildRequest(),
                model: this.model,
                key,
              };
            });
          };
        })
        .flat() as Array<ISubrequest<TResponse, TNetwork, TRequestClass>>;
      return this.extend(this.config, chain) as QueryBuilder<
        TResponse,
        TRequestClass,
        TNetwork,
        TModelClass,
        TModelInstance
      >;
    }

    return this.extend({
      match: [...this.config.match, { include: keys }],
    }) as QueryBuilder<TResponse, TRequestClass, TNetwork, TModelClass, TModelInstance>;
  }

  public request(
    url: string,
  ): QueryBuilder<TResponse, TRequestClass, TNetwork, TModelClass, TModelInstance> {
    return this.extend({
      metadata: {
        ...this.config.metadata,
        url,
      },
    }) as QueryBuilder<TResponse, TRequestClass, TNetwork, TModelClass, TModelInstance>;
  }
}
