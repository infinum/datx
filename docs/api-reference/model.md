---
id: model
title: Model
---

The `Model` is a combination of the [`PureModel`](../api-reference/pure-model) and the [`withMeta`](../mixins/with-meta) and [`withActions`](../mixins/with-actions) mixins:

## PureModel

[`PureModel`](../api-reference/pure-model) features:

- `static type: IType` - The model type
- `static autoIdValue: IIdentifier` - The starting id if auto ID is enabled (default is `0`)
- `static enableAutoId: boolean` - Should the auto ID be generated if no ID is provided (default is `true`)
- `static getAutoId(): IIdentifier` - Returns the next auto ID. Default behaviour is to decrease the `autoIdValue` by one each time (first model has id `-1`, the second one `-2`, etc.)
- `static toJSON(): IType` - Returns the model type - used for serialisation of the model
- `static preprocess(data: object): object` - Function used to preprocess the data before the model is initialised. By default it doesn't do anything.
- `constructor(rawData: IRawModel = {}, collection?: Collection)` - Constructor of the model. The first argument is a raw model or an object with the data that should be added to the new model. The second (optional) argument is a collection instance if the model should be added to it.

## withMeta

[`withMeta`](../mixins/with-meta) mixin exposes a `meta` property with the following properties:

- `collection` - (Optional) A collection the model belongs to
- `id` - The model id
- `type` - The model type
- `original` - (Optional) The original model if the model is a clone
- `refs` - An object with reference ids. The keys are reference names, while the values can be either ids or array of ids (depending on the reference type).
- `snapshot` - An immutable snapshot of the model at this exact moment

## withActions

[`withActions`](../mixins/with-actions) mixin exposes the following methods:

- `assign(key, value)` - Add a new property to the model (or update an existing one)
- `update(data)` - Update the model with an object (key/value)
- `clone()` - Make a clone of the object
- `addReference(key, value, options)` - Add a new reference to the model. Options is an object that requires the following properties:
  - `model` - The referenced model type
  - `type` - Reference type ([`ReferenceType`](References#dynamic-references) enum)
  - `property` - (Optional) Property name for indirect references
