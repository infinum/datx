---
id: jsonapi-getting-started
title: Getting started with JSON API
---

If you're using the JSON API specification for your API, you can install `datx-jsonapi` to take the full advantage of the `datx` library:

```bash
npm install --save datx@2 datx-jsonapi@2 mobx
```

## Polyfilling

The lib makes use of the following features that are not yet available everywhere. Based on your browser support, you might want to polyfill them:

- [Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)
- [Object.assign](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
- [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)

## Documentation

- [Basic configuration](jsonapi-basic-configuration)
- [Network configuration](jsonapi-network-configuration)
- [Network usage](jsonapi-network-usage)
- [Spec compliance](jsonapi-spec-compliance)
- [Model](jsonapi-model)
- [Collection](jsonapi-collection)
- [View](jsonapi-view)
- [Response](jsonapi-response)
- [Config](jsonapi-config)
- [Utils](json-api-utils)
- [TypeScript Interfaces](jsonapi-typescript-interfaces)
