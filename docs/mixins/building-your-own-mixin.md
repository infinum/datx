---
id: building-your-own-mixin
title: Build your own mixin
---

A mixin is a function that receives a class (collection, model, or anything else) and returns the enhanced class. It's very similar to the [higher-order components (HOC)](https://reactjs.org/docs/higher-order-components.html) in React.

## Boilerplate

### Model AND Collection

```typescript
import {ICollectionConstructor, IModelConstructor, isCollection, isModel, PureCollection, PureModel} from 'datx';

import {decorateCollection} from './decorateCollection';
import {decorateModel} from './decorateModel';

export function myAwesome<T extends PureModel>(
  Base: IModelConstructor<T>,
): IModelConstructor<T & IModelWithMixin>;

export function myAwesome<T extends PureCollection>(
  Base: ICollectionConstructor<T>,
): ICollectionConstructor<T & ICollectionWithMixin>;

export function myAwesome<T extends PureModel|PureCollection>(
  Base: IModelConstructor<T>|ICollectionConstructor<T>,
) {
  if (isModel(Base)) {
    return decorateModel(Base as typeof PureModel);
  } else if (isCollection(Base)) {
    return decorateCollection(Base as typeof PureCollection);
  }

  throw new Error('The instance needs to be a model or a collection');
}
```

### Model only (or collection only)

```typescript
import {IModelConstructor, isModel, PureModel} from 'datx';

export function myAwesome<T extends PureModel>(Base: IModelConstructor<T>) {
  const BaseClass = Base as typeof PureModel;

  if (!isModel(Base)) {
    throw new Error('Needs to be a model');
  }

  class MyDecoratedModel extends BaseClass implements IModelWithMixin<T> {
    public awesome: boolean = true;
  }

  return MyDecoratedModel as IModelConstructor<IModelWithMixin<T> & T>;
}
```

**Note:** The important things to note here (TypeScript specific) is to define multiple interfaces for the decorator function if needed, and to define the `IModelWithMixin` and `ICollectionWithMixin` intrefaces (of course, the naming is not important).

## Enhancing a model

```typescript
export function decorateModel(BaseClass: typeof PureModel) {

  class MyDecoratedModel extends BaseClass {
	public awesome: boolean = true;
  }

  return MyDecoratedModel as typeof PureModel;
}
```

## Applying a mixin

```typescript
import { Model } from 'datx';
import myAwesomeMixin from 'my-awesome-mixin';

class Person extends myAwesomeMixin(Model) { /* ... */ }
```

## datx helpers

### isCollection

```typescript
isCollection(obj: typeof PureCollection): true;
isCollection(obj: any): false;
```

Check if the given value is an instance of the datx collection.

### isModel

```typescript
isModel(obj: typeof PureModel): true;
isModel(obj: any): false;
```

Check if the given value is an instance of the datx model.

### getModelMetaKey

```typescript
getModelMetaKey(model: PureModel, key: string): any;
```

Get a meta data of the model.

### setModelMetaKey

```typescript
setModelMetaKey(model: PureModel, key: string, value: any): any;
```

Set a meta data of the model.

**Note:** If you need to save any data about a model, please prefix your keys in order to avoid collisions with other mixins.

## datx-utils

The `datx-utils` plugin contains some helper methods that could be useful for mixin development:

### mapItems

```typescript
mapItems<T, U>(data: Array<T>, fn: (item: T) => U): Array<U>;
mapItems<T, U>(data: T, fn: (item: T) => U): U|null;
```

Iterates trough an array or a single item and call the given function for every item.

### flatten

```typescript
flatten<T>(data: Array<Array<T>>): Array<T>;
```

Flatted a 2-dimensional array into a 1-dimensional array.

### uniq

```typescript
uniq<T>(data: Array<T>): Array<T>;
```

Get only unique items in an array.

### error

```typescript
error(...args): void;
```

Log an error to the console.

### warn

```typescript
warn(...args): void;
```

Log a warning to the console, but not in production mode.

### deprecated

```typescript
deprecated(...args): void;
```

Log a deprecation warning to the console, but not in production mode.

### info

```typescript
info(...args): void;
```

Log an info message to the console, but not in production mode.
