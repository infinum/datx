import { IRequestOptions } from 'datx-jsonapi';
import { Observable } from 'rxjs';

export interface IJsonapiModel {
  save(options?: IRequestOptions): Observable<IJsonapiModel>;

  destroy(options?: IRequestOptions): Observable<void>;
}
