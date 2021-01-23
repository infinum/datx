---
id: version-2.0.0-defining-models
title: Defining models
original_id: defining-models
---

**Note:** If you're defining your own models, you also need to update the [collection configuration](configuring-the-collection).

## TypeScript

The models can be defined by extending the [`Model`](../api-reference/model) class. When extending the [`Model`](../api-reference/model) class, the minimal thing you should do is to define a unique [`type`](../api-reference/model#static-type) (can be either a number or a string):

```typescript
import { Model } from '@datx/core';

class Person extends Model {
  static type = 'person';
}
```

Other things that should be defined are attributes and their default values or [References](references):

```typescript
import { Model, Attribute } from '@datx/core';

class Pet extends Model {
  static type = 'pet';

  @Attribute()
  public name: string;

  @Attribute({ defaultValue: 0 })
  public age: number;

  @Attribute({ toOne: Person })
  public owner: Person;
}
```

In order to ensure some properties are always observables, you should define them with the `Attribute` decorator.

## JavaScript without decorators

Most of the code can remain the same, but the attributes need to be defined separately. In order to ensure some properties are always observables, they need to be marked as attributes (like the `name` property in the example bellow).

#### TypeScript

```typescript
import { Model, prop } from '@datx/core';

class Pet extends Model {
  static type = 'pet';

  public name: string;
  public age: number;
  public owner: Person;
}

Attribute()(Pet, 'name');
Attribute({ defaultValue: 0 })(Pet, 'age');
Attribute({ toOne: Person })(Pet, 'owner');
```

#### JavaScript

```javascript
import { Model, Attribute } from '@datx/core';

class Pet extends Model {
  static type = 'pet';
}

Attribute()(Pet, 'name');
Attribute({ defaultValue: 0 })(Pet, 'age');
Attribute({ toOne: Person })(Pet, 'owner');
```
