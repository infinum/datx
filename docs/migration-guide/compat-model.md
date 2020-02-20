---
id: compat-model
title: CompatModel
---

The idea of [`CompatCollection`](compat-collection) and `CompatModel` is to make migration from `mobx-collection-store` and `mobx-jsonapi-store` simpler.

**Note:** They should be used for migration only, and once you switch to `datx`, you should refactor your collections and models to use [`Model`](../api-reference/model) or [`PureModel`](../api-reference/pure-model). The usage of this class will emit deprecation warnings during development to make migration easier.

`CompatModel` enhances the [`PureModel`](../api-reference/pure-model) with the following properties and methods:

- `static idAttribute` - string, default is `"id"` - the attribute that will be used as id
- `static typeAttribute` - string, default is `"__type__"` - the attribute that will be used as type
- `static refs` - Dictionary of the references. The reference type will always be `TO_ONE_OR_MANY`. Equivalent to [`prop.toOneOrMany`](prop#proptooneormany).
- `static defaults` - Dictionary of default property values. Used also to set observable properties. Equivalent to [`prop`](prop#prop) or [`prop.defaultValue`](prop#propdefaultvalue).
- `getRecordId` - Returns the model ID. Equivalent to [`getModelId`](../api-reference/model-utils#getmodelid).
- `getRecordType` - Returns the model type. Equivalent to [`getModelType`](../api-reference/model-utils#getmodeltype).
- `assign` - Assign a value to a property. Equivalent to [`assignModel`](../api-reference/model-utils#assignmodel).
- `assignRef` - Assign a new reference to the model. Equivalent to [`initModelRef`](../api-reference/model-utils#initmodelref) with the `TO_ONE_OR_MANY` reference type.
- `update` - Update the model with the given key/value object. Equivalent to [`updateModel`](../api-reference/model-utils#updatemodel).
- `static` - Getter for the static model class. Mostly for internal use.
- `toJS` - Get the immutable model snapshot. Equivalent to [`modelToJSON`](../api-reference/model-utils#modeltojson).
- `snapshot` - Getter for the immutable model snapshot. Equivalent to [`modelToJSON`](../api-reference/model-utils#modeltojson).
