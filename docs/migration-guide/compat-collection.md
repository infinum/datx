---
id: compat-collection
title: CompatCollection
---

The idea of `CompatCollection` and [`CompatModel`](compat-model) is to make migration from `mobx-collection-store` and `mobx-jsonapi-store` simpler.

**Note:** They should be used for migration only, and once you switch to `datx`, you should refactor your collections and models to use [`Model`](../api-reference/model) or [`PureModel`](../api-reference/pure-model). The usage of this class will emit deprecation warnings during development to make migration easier.

`CompatCollection` enhances the [`Collection`](../api-reference/collection) with the following properties and methods:

* type getters: If you have a model of type person, you can get all models of the type by using `collection.person`. This is an equivalent to the [`findAll`](../api-reference/collection#findall) method: `collection.findAll('person')` or `collection.findAll(Person)`.
* `static: typeof CompatCollection` - Getter for the collection class. Mostly for internal use.
* `toJS` - Equivalent to the [`toJSON`](../api-reference/collection#tojson) method.