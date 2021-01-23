---
id: version-1.0.0-with-actions
title: withActions
original_id: with-actions
---

`withActions` is a mixin that exposes some methods on the [`PureModel`](../api-reference/pure-model). The mixin is already applied to the regular [`Model`](../api-reference/model).

The mixin exposes the following methods:

- `assign(key, value)` - Add a new property to the model (or update an existing one)
- `update(data)` - Update the model with an object (key/value)
- `clone()` - Make a clone of the object
- `addReference(key, value, options)` - Add a new reference to the model. Options is an object that requires the following properties:
  - `model` - The referenced model type
  - `type` - Reference type ([`ReferenceType`](../getting-started/references#dynamic-references) enum)
  - `property` - (Optional) Property name for indirect references
