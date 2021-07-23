---
id: version-2.0.0-configuring-the-collection
title: Configuring the collection
original_id: configuring-the-collection
---

In order to work properly, the collection needs to know which models it supports. This is done by defining a static `types` array with a list of model classes:

```typescript
import { Collection } from '@datx/core';
import { Person, Pet } from './models';

export class MyCollection extends Collection {
  public static types = [Person, Pet];
}
```

Alternativelly, with JavaScript without class properties:

```javascript
import { Collection } from '@datx/core';
import { Person, Pet } from './models';

class MyCollection extends Collection {}
MyCollection.types = [Person, Pet];

export default MyCollection;
```
