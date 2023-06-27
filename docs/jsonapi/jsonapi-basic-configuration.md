---
id: jsonapi-basic-configuration
title: Basic configuration
---

To apply the mixin to your models and collections, use the `jsonapi` method. Everything from the [`datx` defining models guide](../getting-started/defining-models) also applies.

```typescript
import { Collection, Model } from '@datx/core';
import { config, jsonapiModel } from '@datx/jsonapi';

class Person extends jsonapiModel(Model) {
  static type = 'person';
}

class Pet extends jsonapiModel(Model) {
  static type = 'pet';
}

class MyCollection extends jsonapiModel(Collection) {
  static types = [Person, Pet];
}
```

If you want to also use the network layer of the `datx-jsonapi` mixin, check the [network configuration guide](jsonapi-network-configuration).
