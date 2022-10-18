# @datx/jsonapi-angular

DatX is an opinionated data store. It features support for references to other models and first-class TypeScript support.

`@datx/jsonapi-angular` is a datx mixin that adds [JSON API](https://jsonapi.org/) support for Angular applications.

---

## Configuration

Create a collection, provide it under `APP_COLLECTION` token, import `DatxModule` in your `AppModule` and configure it:

```ts
import { InjectionToken } from '@angular/core';
import { Collection } from '@datx/core';
import { jsonapiAngular } from '@datx/jsonapi-angular';

export const APP_COLLECTION = new InjectionToken<AppCollection>('App collection');

export class AppCollection extends jsonapiAngular(Collection) {
  public static readonly types = [...];
}
```

```ts
import { NgModule } from '@angular/core';
import { DatxModule } from '@datx/jsonapi-angular';
import { AppCollection, APP_COLLECTION } from './collections/app.collection';

@NgModule({
  imports: [
    DatxModule.forRoot({
      baseUrl: 'https://my-api.com/',
    }),
  ],
  providers: [
    {
      provide: APP_COLLECTION,
      useValue: new AppCollection(),
    },
  ],
})
export class AppModule {}
```

You can also provide the config via DI if you need to set the config value based on data from some service:

```ts
import { NgModule } from '@angular/core';
import { DatxModule, DATX_CONFIG } from '@datx/jsonapi-angular';
import { AppCollection, APP_COLLECTION } from './collections/app.collection';
import { EnvironmentVariablesService } from './services/...';

@NgModule({
  imports: [
    DatxModule.forRoot({
      cache: CachingStrategy.NetworkOnly,
    }),
  ],
  provides: [
    {
      provide: APP_COLLECTION,
      useValue: new AppCollection(),
    },
    {
      provide: DATX_CONFIG,
      useFactory: (environmentVariablesService: EnvironmentVariablesService) => {
        return {
          baseUrl: environmentVariablesService.get('MY_API'),
        };
      },
      deps: [EnvironmentVariablesService],
    },
  ],
})
export class AppModule {}
```

Config values passed via `forRoot` and via `DATX_CONFIG` and the default values will be merged together into a final configuration object. Values provided `DATX_CONFIG` DI token take precedence over values from `forRoot`, and default values have the lowest precedence.

In the example above, the final config will use some default values, NetworkOnly caching option (as defined in `forRoot`) and whatever value `environmentVariablesService.get('MY_API')` returns for `baseUrl` (as defined in `DATX_CONFIG` provider).

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
import { BaseModel } from './base-model';

export class Artist extends BaseModel {
  public static endpoint = 'artists';
  public static type = 'project';

  @Attribute()
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

  constructor(@Inject(APP_COLLECTION) protected readonly collection: AppCollection) {
    super(collection);
  }
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
