---
id: version-2.0.0-codemods
title: Codemods
original_id: codemods
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
import { prop } from 'datx';

class User {
  @prop
  public name: string;
}
```

will be transformed to:

```ts
import { Attribute } from 'datx';

class User {
  @Attribute
  public name: string;
}
```
