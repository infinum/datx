import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { config, IRawResponse } from '@datx/jsonapi';
import { IResponseHeaders } from '@datx/utils/dist/interfaces/IResponseHeaders';
import { Observable } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

@Injectable()
export class CustomFetchService {
  constructor(private readonly httpClient: HttpClient) {}

  public async fetch(
    method: string,
    url: string,
    body?: unknown,
    headers: Record<string, string> = {},
    fetchOptions?: { takeUntil$?: Observable<void> },
  ): Promise<IRawResponse> {
    const takeUntil$: Observable<void> | undefined = fetchOptions?.takeUntil$;

    const requestHeaders = {
      ...config.defaultFetchOptions.headers,
      ...headers,
    };

    let request$ = this.httpClient
      .request(method, url, {
        observe: 'response',
        responseType: 'json',
        headers: requestHeaders,
        body,
      })
      .pipe(
        map((response) => {
          return {
            data: response.body,
            headers: (response.headers as unknown) as IResponseHeaders, // The interface actually matches
            requestHeaders,
            status: response.status,
          } as IRawResponse;
        }),
      );

    if (takeUntil$) {
      request$ = request$.pipe(takeUntil(takeUntil$));
    }

    try {
      const d = await request$.toPromise();
      if (d === undefined) {
        // TODO: this is probably unnecessary and can be removed, I am not sure when `d` would be `undefined`
        return { status: -1 }; // Signal to DatX that it shouldn't fail, but shouldn't cache either
      }

      return d;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
}
