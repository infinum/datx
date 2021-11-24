import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IModelConstructor, IRawModel, IType } from '@datx/core';
import { IRequestOptions } from '@datx/jsonapi';
import { IJsonapiCollection, IJsonapiModel, Response } from '@datx/jsonapi-angular';
import { IRecord } from '@datx/jsonapi/dist/interfaces/JsonApi';
import { Observable, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { asyncData } from '../../../test/utils/async-data';
import { ExtractPublic } from '../../types/extract-public';
import { CollectionService } from './collection.service';

@Injectable()
export abstract class CollectionTestingService<
  TModel extends IJsonapiModel,
  TCollection extends IJsonapiCollection,
> implements ExtractPublic<CollectionService<TModel, TCollection>>
{
  protected abstract ctor: IModelConstructor<TModel>;

  constructor(protected readonly collection: TCollection) {}

  public setData(data: Array<IRawModel | IRecord>): Array<TModel> {
    this.collection.removeAll(this.ctor);
    return this.collection.add(data, this.ctor);
  }

  public create(rawModel: IRawModel | IRecord): TModel {
    return this.collection.add(rawModel, this.ctor);
  }

  public createAndSave(rawModel: IRawModel | IRecord): Observable<TModel> {
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
}
