---
id: version-3.0.0-angular-setup
title: Angular JSON:API setup
original_id: angular-setup
---

## Getting started

Steps:

- Install `datx-jsonapi` and `datx-jsonapi-angular`
- [Setup your collection and models](./basic-setup), use [`jsonapiAngular` mixin](../jsonapi-angular/mixin.md) when setting them up
- Set up the [`baseFetch`](../jsonapi-angular/base-fetch.md)

## Use your store

In this section, we will show you a couple different ways of using your store:

### Setup your app

First, we need a special implementation of `baseFetch`. This is needed to integrate with Angular network features like interceptors and request canceling:

```ts
// src/app/services/custom-fetch.ts

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { config, IResponseObject } from '@datx/jsonapi';
import { IResponseHeaders } from 'datx-jsonapi/dist/interfaces/IResponseHeaders';
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
            headers: response.headers as unknown as IResponseHeaders, // The interface actually matches
            requestHeaders,
            status: response.status,
          };
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

### Usage

To use DatX in the app, inject your collection in your component or service and you can start using it. All the networking features will expose rxjs observables.

```ts
// src/app/app.component.ts

export class AppComponent implements OnInit {
  public results$: Observable<Response<Project>>;
  public search$: BehaviorSubject<string> = new BehaviorSubject('');

  constructor(private collection: AppCollection) {}

  public ngOnInit(): void {
    this.results$ = this.setupSearch().pipe(map((result: Response<Project>) => result.data));
  }

  private setupSearch(): Observable<any> {
    return this.search$.pipe(
      switchMap((query: string) => {
        return this.collection.getMany({ queryParams: { filter: { query } } });
      }),
    );
  }

  public onInputChanged(event: any): void {
    this.search$.next(event.target.value);
  }
}
```

```html
<!-- src/app/app.component.html -->
<div *ngFor="let result of results$ | async">{{ result.name }} {{ result.meta.id }}</div>
```

---

## Related

<div class="docs-card">
  <a href="/docs/examples/basic-setup">
    <h4>Basic setup</h4>
    <small>Setup your datx store and models</small>
  </a>
</div>
<div class="docs-card">
  <a href="/docs/examples/adding-models">
    <h4>Adding models</h4>
    <small>Learn the different ways of adding models to your store</small>
  </a>
</div>
