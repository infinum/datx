---
id: deprecations
title: Deprecations in v2
---

## `@prop` attribute

- `@prop` -> `@Attribute()`
- `@prop.toMany(Foo)` -> `@Attribute({ toMany: Foo })`
- etc.

## `fetch` and `fetchAll`

Deprecated in favour of `getOne` and `getMany`. They use the new methods internally, but force caching strategies that were used in the old methods before, to keep the compatibility.
