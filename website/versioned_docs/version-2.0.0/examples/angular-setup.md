---
id: version-2.0.0-angular-setup
title: Angular JSON:API setup
original_id: angular-setup
---

## Getting started

Steps:

- Install `@datx/core`, `@datx/jsonapi`, and `@datx/jsonapi-angular`
- (Optional) Disable MobX by importing `datx/disable-mobx` before any other datx imports
- Import [`DatxModule`](../jsonapi-angular/datx-module.md) and configure it
- [Setup your collection and models](./basic-setup), use [`jsonapiAngular` mixin](../jsonapi-angular/mixin.md) when setting them up
- Extend [`CollectionService`](../jsonapi-angular/collection-service.md) for individual models
- Use services for working with the API

For more details, please check out Infinum's Angular Handbook [DatX data store](https://infinum.com/handbook/books/frontend/angular/angular-guidelines-and-best-practices/datx-data-store) chapter.
