import { Subject } from 'rxjs';
import { Response } from '../Response';

export interface IRxFetchOptions {
  fetchOptions: {
    takeUntil$: Subject<void>;
    Response?: typeof Response;
  };
}
