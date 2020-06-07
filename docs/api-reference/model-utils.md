---
id: model-utils
title: Model utils
---

## assignModel

```typescript
assignModel<T extends PureModel>(model: T, key: string, value: any): void;
```

## updateModel

Update the given model with a given key/value object. Exposed in the [`withActions`](../mixins/with-actions) mixin.

```typescript
updateModel<T extends PureModel>(model: T, data: IDictionary<any>): T;
```

## cloneModel

Clone the given model. Exposed in the [`withActions`](../mixins/with-actions) mixin.

```typescript
cloneModel<T extends PureModel>(model: T): T;
```

## getModelCollection

Get the collection the given model belongs to. Exposed in the [`withMeta`](../mixins/with-meta) mixin.

```typescript
getModelCollection(model: PureModel): PureCollection|undefined;
```

## getModelId

Get the model ID. Exposed in the [`withMeta`](../mixins/with-meta) mixin.

```typescript
getModelId(model: PureModel|IIdentifier): IIdentifier;
```

## getModelType

Get the model type. Exposed in the [`withMeta`](../mixins/with-meta) mixin.

```typescript
getModelType(model: IType|typeof PureModel|PureModel): IType;
```

## getOriginalModel

Get the original model instance (if the given model is a clone). Exposed in the [`withMeta`](../mixins/with-meta) mixin.

```typescript
getOriginalModel(model: PureModel): PureModel;
```

## modelToJSON

Serialise the given model to a plain JavaScript object. Exposed in the [`withMeta`](../mixins/with-meta) mixin.

```typescript
modelToJSON(model: PureModel): IRawModel;
```

## initModelRef

Add a new [dynamic reference](References#dynamic-references) to the given model.

```typescript
initModelRef(obj: PureModel, key: string, options: IReferenceOptions, initialVal: TRefValue): void;
```

## getRefId

Get the id/ids of the referenced models. Exposed in the [`withMeta`](../mixins/with-meta) mixin.

```typescript
getRefId(model: PureModel, key: string): IIdentifier|Array<IIdentifier>;
```

## setRefId

Set the referenced models directly via the ID. This is rarely used. Instead, you should assign the model instances, either as a normal assignment, or by using the `assignModel` or `updateModel` functions.

```typescript
setRefId(model: PureModel, key: string, value: IIdentifier|Array<IIdentifier>): void;
```
