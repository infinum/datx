---
id: version-2.0.0-lib-utils
title: Lib utils
original_id: lib-utils
---

## isCollection

Check if the given value is a datx collection instance.

```typescript
isCollection(obj: any): boolean;
```

## isModel

Check if the given value is a datx model instance.

```typescript
isModel(obj: any): boolean;
```

## commitModel

commit the current state of the model. This will reset the dirty state of all the model attributes to false.

```typescript
commitModel(model: PureModel): void;
```

## revertModel

This will revert the model state to the last commit.

```typescript
revertModel(model: PureModel): void;
```

## isAttributeDirty

Check if a specific model key is dirty.

```typescript
isAttributeDirty<T extends PureModel>(model: T, key: keyof T): boolean;
```
