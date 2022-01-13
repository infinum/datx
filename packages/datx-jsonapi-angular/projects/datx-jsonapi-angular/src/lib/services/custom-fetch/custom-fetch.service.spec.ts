import {
  HttpClient,
  HttpContext,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
  HttpResponse,
} from '@angular/common/http';
import { EMPTY, Observable, of, Subject, throwError } from 'rxjs';
import { CustomFetchService } from './custom-fetch.service';

class HttpClientMock {
  public request(
    _method: string,
    _url: string,
    _options: {
      body?: any;
      headers?:
        | HttpHeaders
        | {
            [header: string]: string | Array<string>;
          };
      context?: HttpContext;
      reportProgress?: boolean;
      observe: 'response';
      params?:
        | HttpParams
        | {
            [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean>;
          };
      responseType?: 'json';
      withCredentials?: boolean;
    },
    // eslint-disable-next-line @typescript-eslint/ban-types
  ): Observable<HttpResponse<Object>> {
    return EMPTY;
  }
}

describe('CustomFetchService', () => {
  let service: CustomFetchService;
  let httpClient: HttpClient;

  beforeEach(() => {
    httpClient = new HttpClientMock() as HttpClient;
    service = new CustomFetchService(httpClient);
  });

  it('should create an instance', () => {
    expect(service).toBeTruthy();
  });

  it(`should call HttpClient's request method in order to make a request`, async () => {
    const requestSpy = jest.spyOn(httpClient, 'request').mockImplementation(() => {
      return of({
        body: { foo: 'bar' },
        headers: new HttpHeaders(),
        status: 200,
      });
    });

    const method = 'GET';
    const url = 'https://api.com';

    const response = await service.fetch(method, url);

    expect(requestSpy).toHaveBeenCalledTimes(1);
    expect(requestSpy).toHaveBeenLastCalledWith(method, url, {
      body: undefined,
      headers: { 'content-type': 'application/vnd.api+json' },
      observe: 'response',
      responseType: 'json',
    });
    expect(response).toBeTruthy();
  });

  it('should re-throw any errors', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    jest.spyOn(httpClient, 'request').mockImplementation(() => {
      return throwError(new HttpErrorResponse({ status: 500 }));
    });

    const method = 'GET';
    const url = 'https://api.com';

    expect(consoleErrorSpy).toHaveBeenCalledTimes(0);

    let error: unknown;
    try {
      await service.fetch(method, url);
    } catch (e) {
      error = e;
    }

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(error).toBeTruthy();
  });

  it('should use takeUntil$ from fetch options if it is set', (done) => {
    // TODO: We can maybe remove takeUntil$ completely, even in v2 (in v3 for sure)

    const takeUntil$ = new Subject<void>();

    jest.spyOn(httpClient, 'request').mockImplementation(() => {
      return of({
        body: { foo: 'bar' },
        headers: new HttpHeaders(),
        status: 200,
      });
    });

    const method = 'GET';
    const url = 'https://api.com';

    service
      .fetch(method, url, undefined, undefined, {
        takeUntil$,
      })
      .then(() => {
        done();
      });

    takeUntil$.next();
    takeUntil$.complete();
  });
});
