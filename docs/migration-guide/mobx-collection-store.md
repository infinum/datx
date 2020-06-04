---
id: mobx-collection-store
title: Mobx collection store
---

## Model definition

This is a complete migration guide. If you want to move to `datx` as fast and possible and refactor later, check out [`CompatCollection`](compat-collection) and [`CompatModel`](compat-model).

### TypeScript

```diff
-- import { Collection, Model } from 'mobx-collection-store';
++ import { Collection, Model, prop } from 'datx';
   import { computed } from 'mobx';

   class Person extends Model {
     public static type = 'person';
--   public static refs = {
--     spouse: 'person',
--     pets: {model: 'pet', property: 'owner'}
--   };

--   public static defaults = {
--     firstName: undefined, // Required to make the props observable
--     lastName: undefined, // Required to make the props observable
--     age: 0
--   };

++   @prop
     public firstName: string;

++   @prop
     public lastName: string;

++   @prop.defaultValue(0)
     public age: number;

++   @prop.toOne(Person)
     public spouse: Person;

++   @prop.toMany(Pet, 'owner')
     public pets: Array<Pet>;

     @computed public get fullName(): string {
       return `${this.firstName} ${this.lastName}`;
     }
   }
```

For `@prop` details check out the [prop documentation](prop).

### JavaScript without decorators

```diff
-- import { Collection, Model } from 'mobx-collection-store';
++ import { Collection, Model, setupModel } from 'datx';
   import { computed } from 'mobx';


-- class Person extends Model {
++ const Person = setupModel(Model, {

--   public static type = 'person';
++   type: 'person',

--   public static refs = {
++   references: {
       spouse: 'person',
       pets: {model: 'pet', property: 'owner'}
--   };
++   },

--   public static defaults = {
++   fields: {
       firstName: undefined, // Required to make the props observable
       lastName: undefined, // Required to make the props observable
       age: 0
--   };
++   }
   }
```

## Collection changes

To migrate your collections, you should move to either [`Collection`](../api-reference/collection) (ideally) or [`CompatCollection`](compat-collection):

### Collection

Changed:

- `insert` can receive only an array, not a single object
- `toJS` was renamed to `toJSON`
- [Removed](https://github.com/infinum/datx/issues/8) `patchListen` and `applyPatch`
- Removed type getters - use `fetchAll` instead

### CompatCollection

Changed:

- `insert` can receive only an array, not a single object
- [Removed](https://github.com/infinum/datx/issues/8) `patchListen` and `applyPatch`

## Model changes

Changed:
To migrate your models, you should move to either [`Model`](odel)/[`PureModel`](../api-reference/pure-model) (ideally) or [`CompatModel`](migration-compat-model):

### CompatModel

The CompatModel class was created to take advantage of most `datx` features, but keeping the configuration almost the same as before:

Same:

- `assign` - Stays the same
- `assignRef` - Stays the same
- `snapshot` - Stays the same
- `toJS` - Stays the same
- `getRecordId` - Stays the same
- `getRecordType` - Stays the same

Changed:

- `patchListen` - [Removed](https://github.com/infinum/datx/issues/8)
- `applyPatch` - [Removed](https://github.com/infinum/datx/issues/8)
- Reference ids - Instead of `model[refName + 'Id']` use `getRefId(refName)`
- `__collection` (undocumented) - Stays the same, but shouldn't use it anyway...

### Model

The Model class is exposing some methods equivalent to the old Model methods:

Same:

- `assign` - Stays the same
- `assignRef` - Stays the same

Changed:

- `snapshot` - Use `model.meta.snapshot`
- `toJS` - Renamed to `toJSON` or use `model.meta.snapshot`
- `patchListen` - [Removed](https://github.com/infinum/datx/issues/8)
- `applyPatch` - [Removed](https://github.com/infinum/datx/issues/8)
- `getRecordId` - Use `model.meta.id`
- `getRecordType` - Use `model.meta.type`
- Reference ids - Instead of `model[refName + 'Id']` use `model.meta.refs[refName]`
- `__collection` (undocumented) - Use `model.meta.collection`

### PureModel

The PureModel class doesn't expose anything directly. Instead, you need to use [helper methods](../api-reference/model-utils):

Changed:

- `assign` - Use `assignModel(model, key, value)`
- `assignRef` - Use `updateModel(model, data)`
- `snapshot` - Use `modelToJSON(model)`
- `toJS` - Use `modelToJSON(model)`
- `patchListen` - [Removed](https://github.com/infinum/datx/issues/8)
- `applyPatch` - [Removed](https://github.com/infinum/datx/issues/8)
- `getRecordId` - Use `getModelId(model)`
- `getRecordType` - Use `getModelType(model)`
- Reference ids - Instead of `model[refName + 'Id']` use `getRefId(refName)`
- `__collection` (undocumented) - Use `getModelCollection(model)`
