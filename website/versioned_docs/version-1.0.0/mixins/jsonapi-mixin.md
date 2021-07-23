---
id: version-1.0.0-jsonapi-mixin
title: JSONAPI Mixin
original_id: jsonapi-mixin
---

If you're using the JSON API specification for your API, you can install `datx-jsonapi` to take the full advantage of the `datx` library:

```bash
npm install --save datx datx-jsonapi mobx
```

## Polyfilling

The lib makes use of the following features that are not yet available everywhere. Based on your browser support, you might want to polyfill them:

- [Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)
- [Object.assign](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
- [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)

## Documentation

- [Basic configuration](../jsonapi/jsonapi-basic-configuration)
- [Network configuration](../jsonapi/jsonapi-network-configuration)
- [Network usage](../jsonapi/jsonapi-network-usage)
- [Spec compliance](../jsonapi/jsonapi-spec-compliance)
- [Model](../jsonapi/jsonapi-model)
- [Collection](../jsonapi/jsonapi-collection)
- [View](../jsonapi/jsonapi-view)
- [Response](../jsonapi/jsonapi-response)
- [Config](../jsonapi/jsonapi-config)
- [Utils](../jsonapi/json-api-utils)
- [TypeScript Interfaces](../jsonapi/jsonapi-typescript-interfaces)
