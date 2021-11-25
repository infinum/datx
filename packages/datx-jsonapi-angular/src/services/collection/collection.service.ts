import { Inject } from '@angular/core';
import { IModelConstructor, IRawModel, IType } from '@datx/core';
import { IRequestOptions } from '@datx/jsonapi';
import { IJsonapiCollection, IJsonapiModel, Response } from '@datx/jsonapi-angular';
import { IRecord } from '@datx/jsonapi/dist/interfaces/JsonApi';
import { EMPTY, Observable } from 'rxjs';
import { expand, map, mapTo, reduce } from 'rxjs/operators';
import { APP_COLLECTION } from '../../injection-tokens';

export abstract class CollectionService<
  TModel extends IJsonapiModel,
  TCollection extends IJsonapiCollection,
> {
  protected abstract readonly ctor: IModelConstructor<TModel>;
  private readonly maxPageSize = 1000;

  constructor(@Inject(APP_COLLECTION) protected readonly collection: TCollection) {}

  public setData(data: Array<IRawModel | IRecord>): Array<TModel> {
    this.collection.removeAll(this.ctor);
    return this.collection.add(data, this.ctor);
  }

  public create(rawModel: IRawModel | IRecord): TModel {
    if (rawModel.id === null || rawModel.id === undefined || rawModel.id === '') {
      delete rawModel.id;
    }

    return this.collection.add(rawModel, this.ctor);
  }

  public createAndSave(rawModel: IRawModel | IRecord): Observable<TModel> {
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
    return model.save().pipe(mapTo(model));
  }

  protected request(
    url: string,
    method?: string,
    data?: object,
    options?: IRequestOptions,
  ): Observable<Response<TModel>> {
    return this.collection.request(url, method, data, options);
  }
}
