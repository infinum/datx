import { Headers, IResponseHeaders } from '@datx/utils';
import { IRequestDetails } from './interfaces/IRequestDetails';
import { IResponseObject } from './interfaces/IResponseObject';
import { Network } from './Network';

export class PromiseNetwork extends Network<Promise<any>> {
  constructor(protected readonly fetchReference: typeof fetch) {
    super();
  }

  public exec<T, U = unknown>(
    asyncVal: Promise<U>,
    successFn?: (value: U) => T,
    failureFn?: (error: Error) => T,
  ): Promise<T> {
    return asyncVal.then(successFn, failureFn);
  }

  public execAll<T>(...asyncVal: Array<Promise<T>>): Promise<Array<T>> {
    return Promise.all(asyncVal);
  }

  public baseFetch(request: IRequestDetails): {
    response: Promise<IResponseObject>;
    abort: () => void;
  } {
    let status = 0;
    let headers: IResponseHeaders = new Headers([]);
    const abortController = new AbortController();
    const headersArray = Object.entries(request.headers).map(([key, value]) => [key, value]);

    const requestInfo: RequestInit = {
      method: request.method,
      body: request.body,
      headers: new globalThis.Headers(headersArray),
      signal: abortController.signal,
    };

    return {
      response: this.fetchReference(request.url, requestInfo)
        .then((res) => {
          status = res.status || status;
          headers = res.headers || headers;
          if (!res.status) {
            throw new Error('Network error');
          }
          const contentType = headers.get('Content-Type');
          if (contentType && contentType.includes('application/json')) {
            return res.json();
          }
          return res.text();
        })
        .then((data) => ({ status, headers, data }))
        .catch((error) => ({ status, headers, error })),
      abort: abortController.abort.bind(abortController),
    };
  }
}
