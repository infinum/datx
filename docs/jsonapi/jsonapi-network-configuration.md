---
id: jsonapi-network-configuration
title: Network configuration
---

To use the network layer, you should check/update the following options:

- Collection [`baseUrl`](jsonapi-config#baseurl) - The base path to the API. Default is `"/"`, but could be something like `"https://example.com/api/"`
- Model [`endpoint`](jsonapi-model) - Path to the model type on the API. If not defined, it will use the model type. This can be used if the url needs to be prefixed (e.g. model scoping) or e.g. if the url is in plural, but the model type is in singular
- [`fetchReference`](jsonapi-config#fetchreference) - Set to `window.fetch` by default, but can be set to some other `fetch` implementation, e.g. `isomorphic-fetch`
- [`defaultFetchOptions`](jsonapi-config#defaultfetchoptions) - If needed, you can define default options that are passed to the fetch method. Keep in mind that the body and method properties will be overridden. By default, it is setting the `content-type` header [according to the JSON API specification](jsonapi-spec-compliance#client-responsibilities)

---

If you want to use some other method of communication with the server (e.g. jQuery, superagent or axios), you can override the [`baseFetch`](jsonapi-config#basefetch) method.

If you need to transform the request and response data dynamically (e.g. setting or getting API tokens/session tokens), you can use [`transformRequest`](jsonapi-config#transformrequest) and [`transformResponse`](jsonapi-config#transformresponse).

---

For a detailed specification of the available options, check out the [config options](jsonapi-config).
