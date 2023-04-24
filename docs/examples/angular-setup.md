---
id: angular-setup
title: Angular JSON:API setup
---

## Installation

```bash
npm install @datx/jsonapi-angular
```

## Setup

### Disable MobX

Update `main.ts` and `test.ts` by adding this import:

```ts title=src/main.ts | src/test.ts
import '@datx/core/disable-mobx';
```

Update `tsconfig.json` mobx path:

```json title=tsconfig.json
{
	"compilerOptions": {
    ...
		"paths": {
			"mobx": ["./noop.js"],
      ...
		},
    ...
	}
}
```

`noop.js` can be just an empty file.

This step will become unnecessary in future versions of DatX.

### Collection

Create a collection and provide it under `APP_COLLECTION` token:

```ts title=src/app/collections/app.collection
import { Collection } from '@datx/core';
import { jsonapiAngular } from '@datx/jsonapi-angular';

export class AppCollection extends jsonapiAngular(Collection) {
  public static readonly types = [...];
}
```

```ts title=src/app/app.module.ts
import { APP_COLLECTION } from '@datx/jsonapi-angular';
import { AppCollection } from './collections/app.collection';

@NgModule({
  providers: [
    {
      provide: APP_COLLECTION,
      useValue: new AppCollection(),
    },
  ],
})
export class AppModule {}
```

### Configure DatX

Provide `DATX_CONFIG` with your own values for the config:

```ts title=src/app/app.module.ts
import { APP_COLLECTION, DATX_CONFIG, setupDatx } from '@datx/jsonapi-angular';
import { AppCollection } from '.collections/app.collection';

@NgModule({
  provides: [
    {
      provide: APP_COLLECTION,
      useValue: new AppCollection(),
    },
    {
      provide: DATX_CONFIG,
      useFactory: (httpClient: HttpClient) => {
        return setupDatx(httpClient, {
          baseUrl: '/api/v1/',
        });
      },
      deps: [HttpClient],
    },
  ],
})
export class AppModule {}
```

## Basic usage example

Create the base model:

```ts
import { IType, Model } from '@datx/core';
import { jsonapiAngular } from '@datx/jsonapi-angular';

export class BaseModel extends jsonapiAngular(Model) {
  public get id(): IType {
    return this.meta.id;
  }
}
```

Create specific domain models and add them to `types` in `AppCollection`

```ts
import { Attribute } from '@datx/core';
import { BaseModel } from 'src/app/base-model';

export class Artist extends BaseModel {
  public static endpoint = 'artists';
  public static type = 'project';

  @Field()
  public name!: string;
}
```

```ts
export class AppCollection extends jsonapiAngular(Collection) {
  public static readonly types = [Artist];
}
```

Create services for managing the models (one service per model):

```ts
import { Inject, Injectable } from '@angular/core';
import { CollectionService } from '@datx/jsonapi-angular';

@Injectable({
  providedIn: 'root',
})
export class ArtistsService extends CollectionService<Artist, AppCollection> {
  protected ctor = Artist;
}
```

Inject the service in your component or other services and use methods like `getManyModels` and `getOneModel`:

```ts
export class ArtistsComponent {
  public artists$ = this.artistsService.getAllModels();

  constructor(private readonly artistsService: ArtistsService) {}
}
```

That's it!
