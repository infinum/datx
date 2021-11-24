---
id: jsonapi-spec-compliance
title: Spec compliance
---

Based on the official v1.0 [specification](http://jsonapi.org/format/), all the features should be implemented. If something is missing or not behaving correctly, feel free to [open an issue](https://github.com/infinum/datx/issues/new/choose).

## Content Negotiation

[Official docs](http://jsonapai.org/format/#content-negotiation)

### Client Responsibilities

[Official docs](http://jsonapi.org/format/#content-negotiation-clients)

The lib is already setting the required headers, but you can also [extend/override them if needed](jsonapi-config#defaultfetchoptions)

### Server Responsibilities

[Official docs](http://jsonapi.org/format/#content-negotiation-servers)

If the server returns any HTTP status 400 or greater (including 406 and 415 mentioned in the spec), the request promise will reject with a [`Response`](jsonapi-response) object that has its `error` property set (message & HTTP status)

## Document Structure

[Official docs](http://jsonapi.org/format/#document-structure)

### Top Level

[Official docs](http://jsonapi.org/format/#document-top-level)

- The lib supports `data`, `errors`, `meta`, `links`, `included`, and `jsonapi` properties:
  - `data`, `error` and `jsonapi` are exsposed in the [`Response`](jsonapi-response) object
  - `included` is consumed by the [`sync`](jsonapi-collection#sync) method
  - `meta` and `links` values are available on the model with [`getModelMeta`](jsonapi-utils#getmodelmeta), [`getModelLinks`](jsonapi-utils#getmodellinks), [`fetchModelLink`](jsonapi-utils#fetchmodellink), [`getModelRefLinks`](jsonapi-utils#getmodelreflinks), [`fetchModelRefLink`](jsonapi-utils#fetchmodelreflink) and [`getModelRefMeta`](jsonapi-utils#getmodelrefmeta).

### Resource Objects

[Official docs](http://jsonapi.org/format/#document-resource-objects)

- The lib expects `id` and `type` properties, and they're available on the [`Model`](../api-reference/model) instance
- If the resource has `attributes`, they will be available as regular properties on the [`Model`](../api-reference/model) instance

- If the resource has `relationships`
  - `links` will be available using the [`getModelRefpLinks`](jsonapi-utils#getmodelreflinks) method on the record
    - Use [`fetchModelRefLink`](jsonapi-utils#fetchmodelreflink) to fetch the link
  - `data` will be used to build the references between models
    - If the store already contains the referenced model or `includes` contains the model it will be available right away on the record: `model[relName]`. Also, the id is available on `model.meta.refs[relName]`
    - If the model is "unknown", the id will be available on `model.meta.refs[relName]`
  - `meta` is available with [`getModelRefMeta`](jsonapi-utils#getmodelrefmeta)
- If the resource has `links` or `meta`, they will be available with the `getLinks` and `getMeta` methods on the record
  - Use `fetchLink` to fetch the link

### Resource Identifier Objects

[Official docs](http://jsonapi.org/format/#document-resource-identifier-objects)

- The lib expects `id` and `type`
- `meta` is available with (`getModelMeta`)[jsonapi-utils#getmodelmeta]

### Compound Objects

[Official docs](http://jsonapi.org/format/#document-compound-documents)

- The lib supports `included` property
- The lib will add `included` resources as references to the `data` resources
- The `included` resources are treated as regular records, just like the `data` resources, with same features and limitations

### Meta Information

[Official docs](http://jsonapi.org/format/#document-meta)

The `meta` property will be available directly on the [`Response`](jsonapi-response) object

### Links

[Official docs](http://jsonapi.org/format/#document-links)

- The `links` property is supported, and exposes all links directly on the [`Response`](jsonapi-response) object
- They are also available in raw form as a `links` property on the [`Response`](jsonapi-response) object
- `response[linkName]` is a function that returns Promise that will resolve to a [`Response`](jsonapi-response) with either the `data` or `error` property set. The link can be a string with an URL.

### JSON API Object

[Official docs](http://jsonapi.org/format/#document-jsonapi-object)

The `jsonapi` property is available on the [`Response`](jsonapi-response) object instance

### Member Names

[Official docs](http://jsonapi.org/format/#document-member-names)

- All member names are treated as strings, therefore adhere to the specification
- If a name is not a valid variable name, e.g. `"first-name"`, you can access it as `model['first-name']`

## Fetching Data

[Official docs](http://jsonapi.org/format/#fetching)

### Fetching Resources

[Official docs](http://jsonapi.org/format/#fetching-resources)

- Fetch top-level `links`
- Fetch resource-level `links` with [`fetchModelLink`](jsonapi-utils#fetchmodellink)
- Fetch `related` link from relationship-level `links` with [`fetchModelRefLink`](jsonapi-utils#fetchmodelreflink)

### Fetching Relationships

[Official docs](http://jsonapi.org/format/#fetching-relationships)

Fetch relationship-level `links` with [`fetchModelRefLink`](jsonapi-utils#fetchmodelreflink)

### Inclusion of Related Resources

[Official docs](http://jsonapi.org/format/#fetching-includes)

Supported by providing a `include` property in the request options ([`IRequestOptions`](jsonapi-typescript-interfaces#irequestoptions))

### Sparse Fieldsets

[Official docs](http://jsonapi.org/format/#fetching-sparse-fieldsets)

Supported by providing a `fields` property in the request options ([`IRequestOptions`](jsonapi-typescript-interfaces#irequestoptions))

### Sorting

[Official docs](http://jsonapi.org/format/#fetching-sorting)

Supported by providing a `sort` property in the request options ([`IRequestOptions`](jsonapi-typescript-interfaces#irequestoptions))

### Pagination

[Official docs](http://jsonapi.org/format/#fetching-pagination)

- The lib supports top-level links
- The lib allows access to raw links in the `links` property of the [`Response`](jsonapi-response) object instance
- The lib allows pagination with links, e.g. `response.next` will return a Promise that will resolve to a [`Response`](jsonapi-response) object with either the `data` or `error` property set
  - The link is lazily evaluated, so the request won't be made until you access the property

### Filtering

[Official docs](http://jsonapi.org/format/#fetching-filtering)

Supported by providing a `filter` property in the request options ([`IRequestOptions`](jsonapi-typescript-interfaces#irequestoptions))

## Creating, Updating and Deleting Resources

[Official docs](http://jsonapi.org/format/#crud)

### Creating Resources

[Official docs](http://jsonapi.org/format/#crud-creating)

- Creating resources is supported using the [`save`](jsonapi-model) method if the record was created on the client
- Client-Generated IDs are supported
  - set [`useAutogeneratedIds`](../api-reference/model#static-useautogeneratedids) to `true`
  - override [`autoIdFunction`](../api-reference/model#static-autoidfunction) so it returns a valid UUID

### Updating Resources

[Official docs](http://jsonapi.org/format/#crud-updating)

Updating resources is supported using the [`save`](jsonapi-model) method if the record was not created on the client

### Updating Relationships

[Official docs](http://jsonapi.org/format/#crud-updating-relationships)

- Direct update of relationships is supported with the [`saveRelationship`](jsonapi-utils#saverelationship) method
- **Tip:** If you want to add a new relationship, use [`initModelRef`](../api-reference/model#initmodelref)

### Deleting Resources

[Official docs](http://jsonapi.org/format/#crud-deleting)

The resource can be deleted with the [`destroy`](jsonapi-model) method on the record

## Query Parameters

[Official docs](http://jsonapi.org/format/#query-parameters)

All current communication with the server is using the required naming method

## Errors

[Official docs](http://jsonapi.org/format/#errors)

### Processing Errors

[Official docs](http://jsonapi.org/format/#errors-processing)

The lib will process all HTTP status 400+ as errors

### Error Objects

[Official docs](http://jsonapi.org/format/#error-objects)

The error objects will be available in the [`Response`](jsonapi-response) object under the `error` property (without any modification)
