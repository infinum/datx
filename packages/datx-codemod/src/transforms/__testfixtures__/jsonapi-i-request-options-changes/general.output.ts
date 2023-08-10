// @ts-nocheck
/* eslint-disable */
import { Collection, Model, View } from '@datx/core';
import { jsonapiCollection, jsonapiModel } from '@datx/jsonapi';

class Comment extends jsonapiModel(Model) {
  public static type = 'comment';
}

class Store extends jsonapiCollection(Collection) {
  public static types = [Comment];
}

const store = new Store();
const comment = new Comment({ id: '1' }, store);
const view = new View(Comment, store);

store.fetch(Comment, 1, {
  networkConfig: {
    headers: {},
  },

  queryParams: {
    include: ['author'],
    filter: { key: 'value' },
    sort: 'name',
    fields: { key: 'value' },
    custom: [{ key: 'key', value: 'value' }],
  },

  cacheOptions: {
    skipCache: true,
  },
});

store.fetchAll(Comment, {
  networkConfig: {
    headers: {},
  },

  queryParams: {
    include: ['author'],
    filter: { key: 'value' },
    sort: 'name',
    fields: { key: 'value' },
    custom: [{ key: 'key', value: 'value' }],
  },

  cacheOptions: {
    skipCache: true,
  },
});

store.getOne(Comment, {
  networkConfig: {
    headers: {},
  },

  queryParams: {
    include: ['author'],
    filter: { key: 'value' },
    sort: 'name',
    fields: { key: 'value' },
    custom: [{ key: 'key', value: 'value' }],
  },

  cacheOptions: {
    skipCache: true,
  },
});

store.getMany(Comment, {
  networkConfig: {
    headers: {},
  },

  queryParams: {
    include: ['author'],
    filter: { key: 'value' },
    sort: 'name',
    fields: { key: 'value' },
    custom: [{ key: 'key', value: 'value' }],
  },

  cacheOptions: {
    skipCache: true,
  },
});

store.getAll(Comment, {
  networkConfig: {
    headers: {},
  },

  queryParams: {
    include: ['author'],
    filter: { key: 'value' },
    sort: 'name',
    fields: { key: 'value' },
    custom: [{ key: 'key', value: 'value' }],
  },

  cacheOptions: {
    skipCache: true,
  },
});

store.request(Comment, 'GET', 'url', {
  networkConfig: {
    headers: {},
  },

  queryParams: {
    include: ['author'],
    filter: { key: 'value' },
    sort: 'name',
    fields: { key: 'value' },
    custom: [{ key: 'key', value: 'value' }],
  },

  cacheOptions: {
    skipCache: true,
  },
});

store.removeOne(Comment, 1, {
  networkConfig: {
    headers: {},
  },

  queryParams: {
    include: ['author'],
    filter: { key: 'value' },
    sort: 'name',
    fields: { key: 'value' },
    custom: [{ key: 'key', value: 'value' }],
  },

  cacheOptions: {
    skipCache: true,
  },
});

store.removeOne(Comment, {
  networkConfig: {
    headers: {},
  },

  queryParams: {
    include: ['author'],
    filter: { key: 'value' },
    sort: 'name',
    fields: { key: 'value' },
    custom: [{ key: 'key', value: 'value' }],
  },

  cacheOptions: {
    skipCache: true,
  },
});

store.removeAll(Comment, {
  networkConfig: {
    headers: {},
  },

  queryParams: {
    include: ['author'],
    filter: { key: 'value' },
    sort: 'name',
    fields: { key: 'value' },
    custom: [{ key: 'key', value: 'value' }],
  },

  cacheOptions: {
    skipCache: true,
  },
});

comment.save({
  networkConfig: {
    headers: {},
  },

  queryParams: {
    include: ['author'],
    filter: { key: 'value' },
    sort: 'name',
    fields: { key: 'value' },
    custom: [{ key: 'key', value: 'value' }],
  },

  cacheOptions: {
    skipCache: true,
  },
});

comment.destroy({
  networkConfig: {
    headers: {},
  },

  queryParams: {
    include: ['author'],
    filter: { key: 'value' },
    sort: 'name',
    fields: { key: 'value' },
    custom: [{ key: 'key', value: 'value' }],
  },

  cacheOptions: {
    skipCache: true,
  },
});

view.getOne(1, {
  networkConfig: {
    headers: {},
  },

  queryParams: {
    include: ['author'],
    filter: { key: 'value' },
    sort: 'name',
    fields: { key: 'value' },
    custom: [{ key: 'key', value: 'value' }],
  },

  cacheOptions: {
    skipCache: true,
  },
});

view.getAll({
  networkConfig: {
    headers: {},
  },

  queryParams: {
    include: ['author'],
    filter: { key: 'value' },
    sort: 'name',
    fields: { key: 'value' },
    custom: [{ key: 'key', value: 'value' }],
  },

  cacheOptions: {
    skipCache: true,
  },
});

const someRandomFunctionWithSimilarInterface = (options) => {};

someRandomFunctionWithSimilarInterface({
  notIRequestOptionProp: 'test',
  headers: {},
  include: ['author'],
  filter: { key: 'value' },
  sort: 'name',
  fields: { key: 'value' },
  params: [{ key: 'key', value: 'value' }],
  skipCache: true,
});

const emptyObject = {
  ...{},
};

await personalTrack?.save({
  networkConfig: {
    headers: {},
  },

  queryParams: {
    include: ['author'],
    filter: { key: 'value' },
    sort: 'name',
    fields: { key: 'value' },
    custom: [{ key: 'key', value: 'value' }],
  },

  cacheOptions: {
    skipCache: true,
  },
});
