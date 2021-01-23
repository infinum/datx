---
id: version-2.0.0-jsonapi-utils
title: Utils
original_id: jsonapi-utils
---

## Model utils

### fetchModelLink

```typescript
fetchModelLink<T extends IJsonapiModel = IJsonapiModel>(
  model: PureModel,
  key: string,
  requestHeaders?: IDictionary<string>,
  options?: IRequestOptions,
): Promise<Response<T>>;
```

Fetch a link defined on a model.

### fetchModelRefLink

```typescript
function fetchModelRefLink<T extends IJsonapiModel = IJsonapiModel>(
  model: PureModel,
  ref: string,
  key: string,
  requestHeaders?: IDictionary<string>,
  options?: IRequestOptions,
): Promise<Response<T>>;
```

Fetch a link defined on a model relationship.

### getModelLinks

```typescript
getModelLinks(model: PureModel): IDictionary<ILink>;
```

Get all links defined on a model.

### getModelMeta

```typescript
getModelMeta(model: PureModel): IDictionary<any>;
```

Get metadata defined on the model.

### getModelRefLinks

```typescript
getModelRefLinks(model: PureModel): IDictionary<IDictionary<ILink>>;
```

Get all links defined on a model relationship.

### getModelRefMeta

```typescript
getModelRefMeta(model: PureModel): IDictionary<any>;
```

Get metadata defined on a model relationship.

### modelToJsonApi

```typescript
modelToJsonApi(model: IJsonapiModel, onlyDirty?: boolean): IRecord;
```

Serialise the model into the JSON API format.

### saveModel

```typescript
saveModel(model: IJsonapiModel, options?: IRequestOptions): Promise<IJsonapiModel>;
```

Save the model to the server. Depending on the model state it will either be created or updated on the server.

### saveRelationship

```typescript
saveRelationship<T extends IJsonapiModel>(
  model: T,
  ref: string,
  options?: IRequestOptions,
): Promise<T>;
```

Save the model relationship on the server.

### getModelEndpointUrl

```typescript
getModelEndpointUrl(model: IJsonapiModel, options?: IRequestOptions): string;
```

Get the URL that's used for API operations for that model.

## Cache utils

### clearAllCache

```typescript
clearAllCache();
```

Clear the complete network cache.

### clearCacheByType

```typescript
clearCacheByType(type: IType);
```

Clear the network cache for the given model type.
