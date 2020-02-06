---
id: defining-models
title: Defining models
---

**Note:** If you're defining your own models, you also need to update the [collection configuration](configuring-the-collection).


## TypeScript

The models can be defined by extending the [`Model`](../api-reference/model) class. When extending the [`Model`](../api-reference/model) class, the minimal thing you should do is to define a unique [`type`](../api-reference/model#static-type) (can be either a number or a string):

```typescript
import {Model} from 'datx';

class Person extends Model {
  static type = 'person';
}
```

Other things that should be defined are props and their default values or [References](references):

```typescript
import {Model, prop} from 'datx';

class Pet extends Model {
  static type = 'pet';

  @prop
  public name: string;

  @prop.defaultValue(0)
  public age: number;

  @prop.toOne(Person)
  public owner: Person;
}
```

In order to ensure some properties are always observables, you should define them with the `prop` decorator.

## JavaScript without decorators

### Option 1

Most of the code can remain the same, but the props need to be defined separately. In order to ensure some properties are always observables, they need to be marked as props (like the `name` property in the example bellow).

#### TypeScript
```typescript
import {Model, prop} from 'datx';

class Pet extends Model {
  static type = 'pet';

  public name: string;
  public age: number;
  public owner: Person;
}

prop(Pet, 'name');
prop.defaultValue(0)(Pet, 'age');
prop.toOne(Person)(Pet, 'owner');
```

#### JavaScript
```javascript
import {Model, prop} from 'datx';

class Pet extends Model {
  static type = 'pet';
}

prop(Pet, 'name');
prop.defaultValue(0)(Pet, 'age');
prop.toOne(Person)(Pet, 'owner');
```

### Option 2

The models can be defined by extending the [`Model`](../api-reference/model) class. When extending the [`Model`](../api-reference/model) class, the minimal thing you should do is to define a unique [`type`](../api-reference/model#static-type) (can be either a number or a string):

```javascript
import {Model} from 'datx';

class Person extends Model {
  static type = 'person';
}
```

Other things that should be defined are props and their default values or [References](references):

```javascript
import {Model, setupModel} from 'datx';

setupModel(Model, {
  type: 'pet',
  references: {
    owner: Person,
  },
  fields: {
    name: undefined,
    age: 0,
  },
});
```

In order to ensure some properties are always observables, you should define them in the `fields` object.
