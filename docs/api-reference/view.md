---
id: view
title: View
---

A datx view is an object containing a list of models of a certain type. The list can be forced to be unique, and it can be dynamically sorted. The models are saved in the parent collection and therefore all references continue to work.

The goal of a view is to provide a subset of models saved in the collection.

## Constructor

```typescript
constructor(
  modelType: IModelConstructor<T>|IType,
  collection: PureCollection,
  sortMethod?: string|((item: T) => any),
  models: Array<IIdentifier|PureModel> = [],
  unique: boolean = false,
)
```

## length

The `length` property exposes the number of models in the view

## list

The `list` property exposes a list of the models in collection. If `sortMethod` was provided, the list will be sorted

## modelType

The type of the referenced models (string or number).

## sortMethod

Used to sort models in the list. Can be either a string (property name used for sorting) or a function that receives a model and returns a sortable value.

## unique

Flag that determines if the view should force model uniqueness.

## snapshot/toJSON()

The snapshot property contains an immutable serialised value of the view. It can be used later to create a copy of the view. Note: `sortMethod` and parent collection can't be serialised.

## add

```typescript
add(data: T|IRawModel|IDictionary<any>): T;
add(data: Array<T|IRawModel|IDictionary<any>>): Array<T>;
```

Adds models to the view and parent collection. Since the view is specific to a single model type, the type property is not needed there (unlike the collection add method).

## hasModel

```typescript
hasItem(model: PureModel|IIdentifier): boolean;
```

Check if the view contains the given model.

## remove

```typescript
remove(model: IIdentifier|PureModel);
```

Removes a model from the view.

## removeAll

```typescript
removeAll(): void;
```

Removes all models from the view.
