---
id: mixin
title: Mixin
---

The `@datx/jsonapi-angular` library exposes the `jsonapiAngular` mixin. Its functionality is similar to the `jsonapi` mixin from the `@datx/jsonapi` library, but instead of Promises, it exposes RxJS Observables as return values for all asynchronous functions:

```ts
// src/app/collections/app.collection.ts
import { Collection } from '@datx/core';
import { jsonapiAngular } from '@datx/jsonapi-angular';

import { Project } from '../models/project.model';
import { User } from '../models/user.model';

export class AppCollection extends jsonapiAngular(Collection) {
  static types = [User, Project];
}
```

```ts
import { Attribute, Model } from '@datx/core';
import { jsonapiAngular } from '@datx/jsonapi-angular';

import { Person } from './person.model';

export class Project extends jsonapiAngular(Model) {
  static type = 'projects';

  @Attribute({ isIdentifier: true })
  public id: string;

  @Attribute()
  public name: string;

  @Attribute({ toOne: Person })
  public author: Person;
}
```
