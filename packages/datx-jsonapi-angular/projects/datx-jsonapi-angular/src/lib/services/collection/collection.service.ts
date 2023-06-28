import { Injectable, inject } from '@angular/core';
import { IModelConstructor, IRawModel, IType } from '@datx/core';
import { IConfigType, IRequestOptions } from '@datx/jsonapi';
import { IResourceObject } from '@datx/jsonapi-types';
import { EMPTY, Observable } from 'rxjs';
import { expand, map, reduce } from 'rxjs/operators';
import { Response } from '../../Response';
import { APP_COLLECTION, DATX_CONFIG } from '../../injection-tokens';
import { IJsonapiCollection } from '../../interfaces/IJsonapiCollection';
import { IJsonapiModel } from '../../interfaces/IJsonapiModel';

@Injectable()
export abstract class CollectionService<
  TModel extends IJsonapiModel,
  TCollection extends IJsonapiCollection,
> {
  protected abstract readonly ctor: IModelConstructor<TModel>;
  private readonly maxPageSize = 1000;
  protected readonly collection: TCollection = inject(APP_COLLECTION);

  /**
   * @note DO NOT REMOVE THIS, OR DATX CONFIG WILL NOT BE INITIALIZED
   *
   * This ensures that DATX_CONFIG factory is run once, whenever some specific CollectionService is used for the first time in application runtime.
   *
   * This makes DatX configuration lazy - it will be configured only when it is needed for the first time (by using some specific CollectionService).
   * For example, when there is an APP_INITIALIZER that fetches some data using some specific CollectionService, this ensures that DatX will be configured in time.
   *
   * Even if noone actually reads datxConfig property, it sill needs to be here in order to trigger the factory. However, if someone does want to check DatX config (for whatever reason), they could read it from here instead of importing the mutated config object from DatX package.
   */
  protected readonly datxConfig: IConfigType = inject(DATX_CONFIG);

  public setData(data: Array<IRawModel | IResourceObject>): Array<TModel> {
    this.collection.removeAll(this.ctor);

    return this.collection.add(data, this.ctor);
  }

  public create(rawModel: IRawModel | IResourceObject): TModel {
    if (rawModel.id === null || rawModel.id === undefined || rawModel.id === '') {
      delete rawModel.id;
    }

    return this.collection.add(rawModel, this.ctor);
  }

  public createAndSave(rawModel: IRawModel | IResourceObject): Observable<TModel> {
    const model = this.create(rawModel);

    return this.update(model);
  }

  public findAll(): Array<TModel> {
    return this.collection.findAll<TModel>(this.ctor);
  }

  public getAllModels(
    requestOptions?: IRequestOptions,
    options?: { pageSize?: number; recursive?: boolean },
  ): Observable<Array<TModel>> {
    const pageSize = options?.pageSize ?? this.maxPageSize;
    const recursive = options?.recursive ?? true;

    const getMany = (pageNumber: number) =>
      this.getMany({
        ...requestOptions,
        queryParams: {
          ...requestOptions?.queryParams,
          custom: (requestOptions?.queryParams?.custom || []).concat([
            `page[size]=${pageSize}`,
            `page[number]=${pageNumber}`,
          ]),
        },
      });

    return getMany(1).pipe(
      expand((response) => {
        if (!recursive || !response.meta) {
          return EMPTY;
        }

        const meta = response.meta as Record<string, number>;
        const currentPage = meta['current_page'];
        const totalPages = meta['total_pages'];

        return currentPage < totalPages ? getMany(currentPage + 1) : EMPTY;
      }),
      map(({ data }) => data),
      reduce((acc, data) => [...acc, ...data]),
    );
  }

  public getMany(options?: IRequestOptions): Observable<Response<TModel>> {
    return this.collection.getMany<TModel>(this.ctor, options);
  }

  public getManyModels(options?: IRequestOptions): Observable<Array<TModel>> {
    return this.getMany(options).pipe(map(({ data }: Response<TModel>) => data));
  }

  public getOne(id: IType, options?: IRequestOptions): Observable<Response<TModel>> {
    return this.collection.getOne(this.ctor, id.toString(), options);
  }

  public findOne(id: IType): TModel | null {
    return this.collection.findOne(this.ctor, id);
  }

  public getOneModel(id: IType, options?: IRequestOptions): Observable<TModel | null> {
    return this.getOne(id, options).pipe(map(({ data }: Response<TModel>) => data));
  }

  public update(model: TModel): Observable<TModel> {
    return model.save().pipe(map(() => model));
  }

  public request(
    url: string,
    method?: string,
    data?: object,
    options?: IRequestOptions,
  ): Observable<Response<TModel>> {
    return this.collection.request(url, method, data, options);
  }
}
