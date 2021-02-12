import { Collection, getModelType, IModelConstructor, IType, Resource } from '@datx/core';
import { IRequestOptions, jsonapi } from '@datx/jsonapi';

// This already contains the partial implementation of the new client concept

export class Client extends jsonapi(Collection) {
  /**
   *
   * @param {string} type Record type
   * @param {number|string} type Record id
   * @param {IRequestOptions} [options] Server options
   */
  public queryResource<TModel extends Resource = Resource>(
    type: IType | IModelConstructor<TModel>,
    id: number | string,
    options?: IRequestOptions,
  ) {
    const modelType = getModelType(type);
    const query = this.__prepareQuery(modelType, id, undefined, options);

    const fetcher = () => this.fetch<TModel>(type, id, options);

    return {
      key: query.url,
      fetcher,
    };
  }

  /**
   * @param {string} type Record type
   * @param {IRequestOptions} [options] Server options
   */
  public queryResources<TModel extends Resource = Resource>(
    type: IType | IModelConstructor<TModel>,
    options?: IRequestOptions,
  ) {
    const modelType = getModelType(type);
    const query = this.__prepareQuery(modelType, undefined, undefined, options);

    const fetcher = () => this.fetchAll<TModel>(type, options);

    return {
      key: query.url,
      fetcher,
    };
  }
}
