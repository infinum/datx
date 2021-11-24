---
id: datx-module
title: DatX module
---

DatX Module has 2 main roles:

- DatX configuration
- provide `CustomFetchService` that is a bridge between DatX's built-in Promise-base API and Angular's Observable-based `HttpClient` for making API calls
  - this is used only internally and most applications will not need any further customization

For more details on how to use and confiture thsi module, please check out Infinum's Angular Handbook [DatX data store](https://infinum.com/handbook/books/frontend/angular/angular-guidelines-and-best-practices/datx-data-store) chapter.
