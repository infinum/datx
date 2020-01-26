---
id: defining-modules
title: Defining modules
---

**Note:** If you're defining your own models, you also need to update the [collection configuration](Configuring-the-collection).


## TypeScript

**Note 🚨:** When using Babel 7 with the new decorators plugin, the [`@prop` decorators are ignored](https://github.com/infinum/datx/issues/92). This is also the case when using the Babel TypeScript plugin (like is the case with [Create react app 2](https://facebook.github.io/create-react-app/) and [Next.js 7](https://nextjs.org/) with the [TypeScript plugin](https://github.com/zeit/next-plugins/tree/master/packages/next-typescript)). If this is the case on your project, you'll need to use one of the other two options bellow.

The models can be defined by extending the [`Model`](Model) class. When extending the [`Model`](Model) class, the minimal thing you should do is to define a unique [`type`](Model#static-type) (can be either a number or a string):

```typescript
import {Model} from 'datx';

class Person extends Model {
  static type = 'person';
}
```

Other things that should be defined are props and their default values or [References](References):

```typescript
import {Model, prop} from 'datx';

class Pet extends Model {
  static type = 'pet';

  @prop name: string;
  @prop.defaultValue(0) age: number;
  @prop.toOne(Person) owner: Person;
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

  name: string;
  age: number;
  owner: Person;
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

The models can be defined by extending the [`Model`](Model) class. When extending the [`Model`](Model) class, the minimal thing you should do is to define a unique [`type`](Model#static-type) (can be either a number or a string):

```javascript
import {Model} from 'datx';

class Person extends Model {
  static type = 'person';
}
```

Other things that should be defined are props and their default values or [References](References):

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
