---
id: version-2.0.0-collection
title: Collection
original_id: collection
---

## Properties

### constructor

```typescript
constructor(data?: Array<object>);
```

The collection constructor can receive an previously serialised collection store:

```javascript
const collectionA = new Collection();
collectionA.add({ firstName: 'John' }, 'person');
const data = collectionA.snapshot;

const collectionB = new Collection(data);

console.log(collectionB.length); // 1
```

### length

The `length` property contains a total number of models in the collection instance.

### snapshot

A current plain JS value of the collection. The value is always immutable - a new instance is created on every change. The property is a computed property, so it can be observed using MobX.

### types

The static `types` property should be an array of all custom model classes.

```typescript
import { Collection } from '@datx/core';

import { Person, Pet } from './models';

export class MyCollection extends Collection {
  public static types = [Person, Pet];
}
```

---

## Methods

### insert

```typescript
public insert(data: Array<object>): Array<IModel>
```

Function used to insert serialised data to the store. The data should be serialised using either the `snapshot` property or the `toJS` function on either a model or collection. The return value is an array of inserted models.

**Important:** [`add`](../api-reference/collection#add) should be used for adding new or existing models to the collection.

### add

```typescript
add<T>(model: Array<IModel>): Array<T>
add<T>(model: IModel): T
add<T>(model: Array<any>, type?: IType | typeof Model): Array<T>
add<T>(model: object, type?: IType | typeof Model): T
```

The `add` method can receive an model instance (or an array of instances) or a plain JS object (or an array of them) and the model type.

You can check out examples [here](../examples/adding-models).

### hasItem

```typescript
hasItem(model: PureModel): boolean
```

Method used to check if a model is in the collection.

### findOne

```typescript
findOne<T>(type: IType, id: string | number | typeof Model): T
```

The `find` method will return the exact model. If no models match, the value `null` will be returned.

### find

```typescript
find<T>(type: (T) => boolean): T
```

The `find` method with the find function behaves like the find method on an array - it will iterate trough all models in the store and call your function for every one of them. It will stop when your function returns a truthy value.

### findAll

```typescript
findAll<T>(type?: IType | typeof Model): Array<T>
```

The `findAll` method will return all models of the given type. If the type is not provided, the method will return a list of all models, just like the `getAllModels` method bellow.

### getAllModels

```typescript
getAllModels<T>(): Array<T>
```

This method returns a list of all models in the collection. The order is not guaranteed, but will most likely be the order in which the models were added to the collection.

**Note:** This method will probably be deprecated in the future in favor of the `findAll` method.

### filter

```typescript
filter(test: TFilterFn): Array<PureModel>
```

A method used to filter through the models, similar to the [Array filter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter). Keep in mind that this will go trough all model types and you should check the model type also.

Alternatively, you can use a combination of `findAll` and the native `filter` method instead:

```typescript
data.findAll(User).filter((user) => user.age >= 18);
```

### removeOne

```typescript
removeOne<T>(type: IType | typeof Model, id: string | number): void;
removeOne<T>(model: PureModel): void;
```

If a model is provided as a single argument, the `remove` method will remove that exact model from the collection.

If the first argument is a model type (string, number, or class), it will find the model based on second argument id, and remove it. If the model with provided id does not exist, nothing will be removed.

### removeAll

```typescript
removeAll<T>(type?: IType | typeof Model): void
```

The `removeAll` method will remove all models of the given type from the collection, and it will return the list of removed model instances.
If `removeAll` is called without arguments, it will remove all models and behave in the same way as the `reset` method bellow.

### reset

```typescript
reset(): void
```

The `reset` method will remove all models from the collection.

### toJSON

```typescript
toJSON(): Array<IDictionary>
```

The `toJSON` method will return the serialised version of the collection. Since this is a plain JS object (actually, an array of objects), it can be transformed to a string and sent trough network or saved to localStorage and be reinitialised later.
