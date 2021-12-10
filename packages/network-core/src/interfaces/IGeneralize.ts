import { Observable } from 'rxjs';

import { IAsync } from './IAsync';

export type IGeneralize<TDataType, TAsync extends IAsync<any>> = TAsync extends Promise<any>
  ? Promise<TDataType>
  : Observable<TDataType>;
