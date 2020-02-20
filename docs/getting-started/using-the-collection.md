---
id: using-the-collection
title: Using the collection
---

## Initialisation

The collection can be initialised without any parameters, or it can receive a previously serialised collection. To serialise a collection, the [`snapshot`](../api-reference/collection#snapshot) getter should be used:

```javascript
const collectionA = new Collection();
collectionA.add({ firstName: 'John' }, 'person');
const data = collectionA.snapshot;

const collectionB = new Collection(data);
console.log(collectionB.length); // 1
```

## Adding models

Models can be added to a collection in four ways:

1. As an existing model instance: `collection.add(modelInstance);`
2. As an array of existing model instances: `collection.add([modelInstanceA, modelInstanceB]);`
3. As an plain object and a model type: `collection.add(plainObject, modelType);`
4. As an array of plain objects and a model type: `collection.add([plainObjectA, plainObjectB], modelType);`

The returned value will be a model instance or an array of model instances.

**Note:** When adding an array of plain JS objects, all of them need to be of the same type.

## Finding models

### Find all models of a certain type

```javascript
console.log(collection.findAll('person')); // An array of models
```

### Finding an exact model

```javascript
console.log(collection.findOne('person', 1));
```

## Removing models

```javascript
// Removing an exact model
collection.removeOne('person', 1);

// Remove all models of a certain type
collection.removeAll('person');

// Empty the collection
collection.reset();
```

## Updating models

Existing properties on models can be updated with normal property assignments. There are also three methods that can be used: [`assignModel`](../api-reference/model#assignmodel), [`initModelRef`](../api-reference/model#initmodelref) and [`updateModel`](../api-reference/model#updatemodel):

```javascript
const john = collection.add({ firstName: 'John', lastName: 'Doe' }, Person); // Model class can be used as type
const jane = collection.add({ firstName: 'Jane', lastName: 'Doe' }, 'person'); // Type string/number is also valid

// Should be used only for existing properties
john.lastName = 'Smith';

// Can be used for existing and new properties
assignModel(john, 'age', 42);

// Assign a new dynamic reference to a model
import { ReferenceType } from 'datx';
initModelRef(john, 'spouse', { model: Person, type: ReferenceType.TO_ONE }, jane);

// Update multiple values
updateModel(john, { lastName: 'Williams', age: 25, spouse: null, city: 'San Francisco' });
```

**Note:** Direct assignment should not be used for new properties because the added property won't be observable (this is a MobX limitation).

---

For specifics about the exact parameters that can be used with the mentioned methods, check out the [Collection API reference](../api-reference/collection).
