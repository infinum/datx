---
id: jsonapi-network-usage
title: Network usage TODO
---

## `getOne` example

```typescript
import { Collection, Model } from '@datx/core';
import { config, jsonapi } from '@datx/jsonapi';
config.baseUrl = 'https://example.com/';

class MyCollection extends jsonapi(Collection) {}
const collection = new MyCollection();

collection
  .getOne('event', 1) // This will make a GET request to https://example.com/event/1
  .then((response) => {
    const event = response.data;
    console.log(event.id); // 1
  });
```

## `getMany` example

```typescript
import { Collection, Model } from '@datx/core';
import { config, jsonapi } from '@datx/jsonapi';
config.baseUrl = 'https://example.com/';

class MyCollection extends jsonapi(Collection) {}
const collection = new MyCollection();

collection
  .getMany('event') // This will make a GET request to https://example.com/event
  .then((response) => {
    const events = response.data;
    console.log(events.length); // e.g. 5
    console.log(events[0].id); // e.g. 1
  });
```

## `request` example

The request method can be used if something (url, method, etc.) is not standard:

```typescript
import { Collection, Model } from '@datx/core';
import { config, jsonapi } from '@datx/jsonapi';
config.baseUrl = 'https://example.com/';

class MyCollection extends jsonapi(Collection) {}
const collection = new MyCollection();

collection
  .request('event/1/like', 'POST') // This will make a POST request to https://example.com/event/1/like
  .then((response) => {
    // The expected response of the API call is still a valid JSON API response
    const event = response.data;
  });
```

## Pagination example

```typescript
import { Collection, Model } from '@datx/core';
import { config, jsonapi } from '@datx/jsonapi';

config.baseUrl = 'https://example.com/';

class MyCollection extends jsonapi(Collection) {}
const collection = new MyCollection();

// Get a list of all users if the API requires pagination
// Note: In normal usage, you should also have some error handling
async function getAllUsers() {
  const users = [];
  let response = await collection.getMany('user'); // GET https://example.com/user
  users.push(...response.data);
  while (response.next) {
    response = await response.next();
    users.push(...response.data);
  }
  return users;
}
```
