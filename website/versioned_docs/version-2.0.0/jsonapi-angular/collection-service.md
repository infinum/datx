---
id: version-2.0.0-collection-service
title: Collection service
original_id: collection-service
---

In Angular, it is a common practice to create a service for each model type that is in charge of working with that model. The `@datx/jsonapi-angular` library exposes the `CollectionService` abstract class that can be extended for individual models. It includes some commonly used methods like `getAllModels` and `getOneModel`. If a specific model type needs some custom functionality, it can be added in that model's service, while keeping all of the functionality provided by the base `CollectionService` class.

There is also a testing double of the service (`CollectionTestingService`) that works exclusively with in-memory data.

For more details on how to use this service, please check out Infinum's Angular Handbook [DatX data store](https://infinum.com/handbook/books/frontend/angular/angular-guidelines-and-best-practices/datx-data-store) chapter.
