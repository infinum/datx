import { Subject } from 'rxjs';

export interface IRxFetchOptions {
  fetchOptions: {
    takeUntil$: Subject<void>;
  }
}