---
id: version-2.0.0-base-fetch
title: Angular JSON:API baseFetch
original_id: base-fetch
---

By default, the library will use the FetchAPI to do all the networking. This is not ideal when using Angular as it would remove some useful features like interceptors and request cancellation.

`@datx/jsonapi-angular` implements some hooks which can be used in combination with a custom `baseFetch` implementation to get those features back.

Here is an example of the implementation, but you might have some other needs:

```ts
// src/app/services/custom-fetch.ts

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { config, IResponseObject } from '@datx/jsonapi';
import { IResponseHeaders } from '@datx/jsonapi/dist/interfaces/IResponseHeaders';
import { Observable } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class CustomFetchService {
  constructor(private httpClient: HttpClient) {}

  public async fetch(
    method: string,
    url: string,
    body?: unknown,
    headers: Record<string, string> = {},
    fetchOptions?: { takeUntil$?: Observable<void> },
  ): Promise<IResponseObject> {
    const takeUntil$: Observable<void> | undefined = fetchOptions?.takeUntil$;

    const requestHeaders = {
      ...config.defaultFetchOptions.headers,
      ...headers,
    };

    let request$ = this.httpClient.request(method, url, {
      observe: 'response',
      responseType: 'json',
      headers: requestHeaders,
      body,
    }).pipe(
      map((response) => {
        return {
          data: response.body,
          headers: response.headers as unknown as IResponseHeaders, // The interface actually matches
          requestHeaders,
          status: response.status,
        } as IResponseObject;
      }),
    );

    if (takeUntil$) {
      request$ = request$.pipe(takeUntil(takeUntil$));
    }

    try {
      const d = await request$.toPromise();
      if (d === undefined) {
        return { status: -1 }; // Signal to DatX that it shouldn't fail, but shouldn't cache either
      }

      return d;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
}
```

The last step is to initialize all the settings:

```ts
// src/app/app/module.ts

import { APP_INITIALIZER } from '@angular/core';
import { CustomFetchService } from './services/custom-fetch.service';
import { CachingStrategy, config } from '@datx/jsonapi';

function initDatx(customFetch: CustomFetchService): () => Promise<void> {
  return async () => {
    config.baseFetch = customFetch.fetch.bind(customFetch);

    config.defaultFetchOptions = {
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/vnd.api+json',
      },
    };

    // Use cache if not older than 10 seconds
    config.maxCacheAge = 10;
    config.cache = CachingStrategy.CacheFirst;
  };
}

// ... in the module providers
  {
    provide: APP_INITIALIZER,
    useFactory: initDatx,
    multi: true,
    deps: [CustomFetchService],
  }

```
