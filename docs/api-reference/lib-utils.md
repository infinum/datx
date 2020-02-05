---
id: lib-utils
title: Lib utils
---

## setupModel

Helper used to set up models [without using decorators](defining-models#javascript-without-decorators).

```typescript
setupModel<IModel extends PureModel, IFields extends IDictionary<any>>(
  Base: IModelConstructor<IModel>,
  {
    fields,
    references,
    type,
    idAttribute,
    typeAttribute,
  }: {
    fields: IFields;
    references?: IDictionary<IReferenceOptions>;
    type?: IType;
    idAttribute?: string;
    typeAttribute?: string;
  } = {fields: {} as IFields},
);
```

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
