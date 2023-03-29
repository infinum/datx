---
id: version-2.0.0-jsonapi-basic-configuration
title: Basic configuration
original_id: jsonapi-basic-configuration
---

To apply the mixin to your models and collections, use the `jsonapi` method. Everything from the [`datx` defining models guide](../getting-started/defining-models) also applies.

```typescript
import { Collection, Model } from '@datx/core';
import { config, jsonapiCollection, jsonapiModel } from '@datx/jsonapi';

class Person extends jsonapiModel(Model) {
  static type = 'person';
}

class Pet extends jsonapiModel(Model) {
  static type = 'pet';
}

class MyCollection extends jsonapiCollection(Collection) {
  static types = [Person, Pet];
}
```

If you want to also use the network layer of the `datx-jsonapi` mixin, check the [network configuration guide](jsonapi-network-configuration).
