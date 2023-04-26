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

## Available Transforms

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
