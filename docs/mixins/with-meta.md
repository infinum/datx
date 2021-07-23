---
id: with-meta
title: withMeta
---

`withMeta` is a mixin that exposes some metadata on the [`PureModel`](../api-reference/pure-model). The mixin is already applied to the regular [`Model`](../api-reference/model).

The mixin exposes a `meta` property with the following properties:

- `collection` - (Optional) A collection the model belongs to
- `id` - The model id
- `type` - The model type
- `original` - (Optional) The original model if the model is a clone
- `refs` - An object with reference ids. The keys are reference names, while the values can be either ids or array of ids (depending on the reference type).
- `dirty` - An object with dirty states of all attributes of the model
- `snapshot` - An immutable snapshot of the model at this exact moment
