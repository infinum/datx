---
id: codemods
title: Codemods
---

DatX provides Codemod transformations to help upgrade your DatX codebase when a feature is deprecated.

Codemods are transformations that run on your codebase programmatically. This allows for a large number of changes to be applied without having to manually go through every file.

## Usage

`npx @datx/codemod@latest <transform> <path>`

- `transform` - name of transform, see available transforms below.
- `path` - files or directory to transform.
- `--dry` - dry run (no changes are made to files)
- `--print` - print output, useful for development

## Datx 3.0.0

### `attribute-to-field`

In DatX 3.0.0, the `@Attribute` decorator is renamed to `@Field`. This codemod transforms the `@Attribute` decorator to the `@Field` decorator.

For example, the following code:

```ts
import { Model, Attribute } from '@datx/core';

class Pet extends Model {
  public static type = 'pet';

  @Attribute()
  public name!: string;

  @Attribute({
    isIdentifier: true,
  })
  public id!: string;

  @Attribute({
    isType: true,
  })
  public type!: string;

  @Attribute({
    defaultValue: 0,
  })
  public age: number;

  @Attribute({
    toOne: Person,
  })
  public owner: Person;

  @Attribute({
    toOneOrMany: Person,
  })
  public owners: Person | Person[];

  @Attribute({
    toMany: Person,
  })
  public friends: Person[];

  @Attribute({
    toMany: Person,
    referenceProperty: 'backProp',
  })
  public friends2: Person[];
}
```

will be transformed to:

```ts
import { Model, Field } from '@datx/core';

class Pet extends Model {
  public static type = 'pet';

  @Field()
  public name!: string;

  @Field({
    isIdentifier: true,
  })
  public id!: string;

  @Field({
    isType: true,
  })
  public type!: string;

  @Field({
    defaultValue: 0,
  })
  public age: number;

  @Field({
    toOne: Person,
  })
  public owner: Person;

  @Field({
    toOneOrMany: Person,
  })
  public owners: Person | Person[];

  @Field({
    toMany: Person,
  })
  public friends: Person[];

  @Field({
    toMany: Person,
    referenceProperty: 'backProp',
  })
  public friends2: Person[];
}
```

## Datx 2.0.0

### `prop-to-attribute`

This codemod transforms the `@prop` decorator to the `@Attribute` decorator.

For example, the following code:

```ts
import { Model, prop } from 'datx';

class Pet extends Model {
  @prop
  public name!: string;

  @prop.identifier
  public id!: string;

  @prop.type
  public type!: string;

  @prop.defaultValue(0)
  public age: number;

  @prop.toOne(Person)
  public owner: Person;

  @prop.toOneOrMany(Person)
  public owners: Person | Person[];

  @prop.toMany(Person)
  public friends: Person[];

  @prop.toMany(Person, 'backProp')
  public friends2: Person[];
}
```

will be transformed to:

```ts
import { Model, Attribute } from '@datx/core';

class Pet extends Model {
  @Attribute()
  public name!: string;

  @Attribute({
    isIdentifier: true,
  })
  public id!: string;

  @Attribute({
    isType: true,
  })
  public type!: string;

  @Attribute({
    defaultValue: 0,
  })
  public age: number;

  @Attribute({
    toOne: Person,
  })
  public owner: Person;

  @Attribute({
    toOneOrMany: Person,
  })
  public owners: Person | Person[];

  @Attribute({
    toMany: Person,
  })
  public friends: Person[];

  @Attribute({
    toMany: Person,
    referenceProperty: 'backProp',
  })
  public friends2: Person[];
}
```

### `scoped-package-name`

The packages are now scoped under `@datx` and the `datx` prefix is deprecated. This codemod transforms the package names to the new scoped names.

For example, the following code:

```ts
import * as utils from 'datx-utils';
import * as datx from 'datx';
import * as jsonapi from 'datx-jsonapi';
```

will be transformed to:

```ts
import * as utils from '@datx/utils';
import * as datx from '@datx/core';
import * as jsonapi from '@datx/jsonapi';
```

### `jsonapi-i-request-options-changes`

The `IRequestOptions` interface has been changed to a different shape to allow for more flexibility. This codemod transforms the `IRequestOptions` interface to the new shape based on this migration guide [here](/docs/migration-guide/from-v1#json-api-irequestoptions-changes).

For example, the following code:

```ts
store.fetch(Comment, 1, {
  headers: {},
  include: ['author'],
  filter: { key: 'value' },
  sort: 'name',
  fields: { key: 'value' },
  params: [{ key: 'key', value: 'value' }],
  skipCache: true,
});
```

will be transformed to:

```ts
store.fetch(Comment, 1, {
  networkConfig: {
    headers: {},
  },

  queryParams: {
    include: ['author'],
    filter: { key: 'value' },
    sort: 'name',
    fields: { key: 'value' },
    custom: [{ key: 'key', value: 'value' }],
  },

  cacheOptions: {
    skipCache: true,
  },
});
```

### `jsonapi-pagination`

The pagination is now using methods instead of just plain property access: `await response.next` becomes `await response.next()`.

For example, the following code:

```ts hihglight-line="8"
async function getAllUsers() {
  const users = [];
  let response = await collection.fetchAll('user');

  users.push(...response.data);

  while (response.next) {
    response = await response.next; // <-- this line
    users.push(...response.data);
  }

  return users;
}
```

will be transformed to:

```ts hihglight-line="8"
async function getAllUsers() {
  const users = [];
  let response = await collection.fetchAll('user');

  users.push(...response.data);

  while (response.next) {
    response = await response.next(); // <-- this line
    users.push(...response.data);
  }

  return users;
}
```
