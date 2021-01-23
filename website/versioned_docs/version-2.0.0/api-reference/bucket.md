---
id: version-2.0.0-bucket
title: Bucket
original_id: bucket
---

Buckets are a new concept in DatX 2. They're mostly used for internal references and lists (e.g. model references and views), but can also be used outside of the library.

There are three types of buckets - the differences are in the first argument of the constructor and in the value of the bucket.

Constructor:

```typescript
  data, // The data that is saved in the bucket
  collection?: PureCollection, // The collection that the bucket is using for references
  readonly: boolean = false, // Should the bucket be readonly
  model?: PureModel, // Model the bucket belongs to (for internal usage)
  key?: string, // The key in the model where the bucket is saved in (for internal usage)
  skipMissing = true, // (for internal usage)
```

It has three properties:

- `value` - the bucket value (also a setter)
- `refValue` - the reference value - contains the type and id
- `snapshot` - the bucket snapshot

It also has two methods:

- `setCollection` - set the reference collection after the bucket has been created
- `toJSON` - the serialized version of the bucket

## Bucket.ToOne

A bucket that references only one datx model. Probably the least useful of the three.

```typescript
  data: T | IModelRef | null, // The data that is saved in the bucket
```

## Bucket.ToOneOrMany

A bucket that can reference one or multiple models. The value will be either a single model or an array of models.

```typescript
  data: Array<T | IModelRef> | T | IModelRef | null, // The data that is saved in the bucket
```

## Bucket.ToMany

A bucket that can reference multiple models. The value will be an array of models.

```typescript
  data: Array<T | IModelRef> | null, // The data that is saved in the bucket
```
