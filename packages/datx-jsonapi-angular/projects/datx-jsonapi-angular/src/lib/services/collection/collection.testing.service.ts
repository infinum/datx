import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { IModelConstructor, IRawModel, IType } from '@datx/core';
import { IConfigType, IRequestOptions } from '@datx/jsonapi';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Response } from '../../Response';
import { APP_COLLECTION, DATX_CONFIG } from '../../injection-tokens';
import { IJsonapiCollection } from '../../interfaces/IJsonapiCollection';
import { IJsonapiModel } from '../../interfaces/IJsonapiModel';
import { ExtractPublic } from '../../types/extract-public';
import { CollectionService } from './collection.service';
import { IResourceObject } from '@datx/jsonapi-types';

// TODO: share this helper somehow (the build will break if it is imported from ../../../test/utils and if test dir is not in listed in tsconfig include array)
function asyncData<TData>(data: TData): Observable<TData> {
  return of(data).pipe(delay(0));
}

@Injectable()
export abstract class CollectionTestingService<
  TModel extends IJsonapiModel,
  TCollection extends IJsonapiCollection,
> implements ExtractPublic<CollectionService<TModel, TCollection>>
{
  protected abstract ctor: IModelConstructor<TModel>;

  protected readonly collection: TCollection = inject(APP_COLLECTION);
  protected readonly datxConfig: IConfigType = inject(DATX_CONFIG);

  public setData(data: Array<IRawModel | IResourceObject>): Array<TModel> {
    this.collection.removeAll(this.ctor);

    return this.collection.add(data, this.ctor);
  }

  public create(rawModel: IRawModel | IResourceObject): TModel {
    return this.collection.add(rawModel, this.ctor);
  }

  public createAndSave(rawModel: IRawModel | IResourceObject): Observable<TModel> {
    const model = this.create(rawModel);

    return this.update(model);
  }

  public findAll(): Array<TModel> {
    return this.collection.findAll(this.ctor);
  }

  public getAllModels(_options?: IRequestOptions): Observable<Array<TModel>> {
    return asyncData(this.collection.findAll(this.ctor));
  }

  public getMany(_options?: IRequestOptions): Observable<Response<TModel>> {
    const data = this.collection.findAll(this.ctor);

    return asyncData({ data, meta: { total_count: data.length } } as Response<TModel>);
  }

  public getManyModels(_options?: IRequestOptions): Observable<Array<TModel>> {
    return asyncData(this.collection.findAll(this.ctor));
  }

  public getOne(id: IType, _options?: IRequestOptions): Observable<Response<TModel>> {
    return asyncData({ data: this.collection.findOne(this.ctor, id) } as Response<TModel>);
  }

  public getOneModel(id: IType, _options?: IRequestOptions): Observable<TModel | null> {
    const model = this.collection.findOne(this.ctor, id);

    if (!model) {
      return throwError(
        new HttpErrorResponse({
          status: 404,
        }),
      ).pipe(delay(0));
    }

    return asyncData(model);
  }

  public findOne(id: IType): TModel | null {
    return this.collection.findOne(this.ctor, id);
  }

  public update(model: TModel): Observable<TModel> {
    return asyncData(model);
  }

  public request(
    url: string,
    method?: string | undefined,
    data?: object | undefined,
    options?: IRequestOptions | undefined,
  ): Observable<Response<TModel>> {
    return this.collection.request(url, method, data, options);
  }
}
