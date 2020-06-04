---
id: references
title: References
---

The main feature of the library are the references between models. There are two types of references, and they can be defined with the `Attribute` decorator on the model:

## Direct references

The direct reference can be used if a object contains a reference to another object over id, or it has the other object nested:

```javascript
// ID
{
  firstName: 'John',
  lastName: 'Doe',
  spouse: 2,
}
// Nested
{

  firstName: 'John',
  lastName: 'Doe',
  spouse: {
    firstName: 'Jane',
    lastName: 'Doe'
  }
}
```

The references are defined with the `Attribute` decorator and can be one of three types:

- one to one - references a model
- one to many - an array of references
- one to one or many - a direct reference or an array of references (depending on the value you set)

```typescript
class Person extends Model {
  static type = 'person';

  @Attribute({ isIdentifier: true })
  public id!: number;

  @Attribute()
  public firstName!: string;

  @Attribute()
  public lastName!: string;

  @Attribute({ toOne: Person })
  public spouse!: Person;
}

class Pet extends Model {
  static type = 'pet';

  @Attribute()
  public name!: string;

  @Attribute({ toOne: Person })
  public owner!: Person;
}

class MyCollection extends Collection {
  static types = [Person, Pet];
}

const collection = new MyCollection();

const jane = collection.add({ firstName: 'Jane', id: 1 }, Person);
const steve = collection.add({ firstName: 'Steve', spouse: 1 }, Person);
const fido = collection.add({ name: 'Fido', owner: steve }, Pet);

console.log(steve.spouse.firstName); // Jane
console.log(fido.owner.spouse.firstName); // Jane
```

## Indirect references

Indirect references are used when the object is not directly referencing the target model. However, the other model has a direct reference to our object.
In the previous example, we had a Pet model that had a direct reference to the Person model (owner).

Since there is a direct reference in one direction, we can create a indirect reference in the other direction:

```javascript
class Person extends Model {
  static type = 'person';

  @Attribute({ isIdentifier: true })
  id: number;

  @Attribute()
  firstName: string;

  @Attribute()
  lastName: string;

  @Attribute({ toOne: Person })
  spouse: Person;

  @Attribute({ toMany: Pet, referenceProperty: 'owner' })
  pets: Array<Pet>;
}

class MyCollection extends Collection {
  static types = [Person, Pet];
}

const collection = new MyCollection();

const jane = collection.add({ firstName: 'Jane', id: 1 }, Person);
const steve = collection.add({ firstName: 'Steve', spouse: 1 }, Person);
const fido = collection.add({ name: 'Fido', owner: steve }, Pet);

console.log(steve.pets.length); // 1
console.log(steve.pets[0].name); // Fido
```

In this example, we define that the Person model has a reference to all Pet models that have the reference to this Person model instance in the `owner` property.

## Dynamic references

If you need to add an reference that is specific only to one instance of the model, you can use the `initModelRef` method:

```javascript
import { initModelRef, ReferenceType } from 'datx';

initModelRef(bob, 'siblings', { model: Person, type: ReferenceType.TO_MANY }, [john]);
```

The `ReferenceType` enum has three possible values:

- `TO_ONE` - Reference a single model
- `TO_MANY` - Reference an array of models. This reference type is also used for indirect references.
- `TO_ONE_OR_MANY` - Reference any number of models (the reference can be a model or an array of models).

## Limitations

There are currently three limitations:

1. There is no way to have both direct and indirect references for the same property, e.g. when we set a `spouse` property on the steve model, jane model won't have the spouse property automatically defined - we need to do it manually.
2. A model (as opposed to the id reference) reference can't be set on a model if it's not in a collection (any collection).
3. If a model has a reference and it's not in a collection or the referenced model is not in the same collection, only the reference model id can be retrieved.
