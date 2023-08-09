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
  headers: {},
  include: ['author'],
  filter: { key: 'value' },
  sort: 'name',
  fields: { key: 'value' },
  params: [{ key: 'key', value: 'value' }],
  skipCache: true,
});

store.fetchAll(Comment, {
  headers: {},
  include: ['author'],
  filter: { key: 'value' },
  sort: 'name',
  fields: { key: 'value' },
  params: [{ key: 'key', value: 'value' }],
  skipCache: true,
});

store.getOne(Comment, {
  headers: {},
  include: ['author'],
  filter: { key: 'value' },
  sort: 'name',
  fields: { key: 'value' },
  params: [{ key: 'key', value: 'value' }],
  skipCache: true,
});

store.getMany(Comment, {
  headers: {},
  include: ['author'],
  filter: { key: 'value' },
  sort: 'name',
  fields: { key: 'value' },
  params: [{ key: 'key', value: 'value' }],
  skipCache: true,
});

store.getAll(Comment, {
  headers: {},
  include: ['author'],
  filter: { key: 'value' },
  sort: 'name',
  fields: { key: 'value' },
  params: [{ key: 'key', value: 'value' }],
  skipCache: true,
});

store.request(Comment, 'GET', 'url', {
  headers: {},
  include: ['author'],
  filter: { key: 'value' },
  sort: 'name',
  fields: { key: 'value' },
  params: [{ key: 'key', value: 'value' }],
  skipCache: true,
});

store.removeOne(Comment, 1, {
  headers: {},
  include: ['author'],
  filter: { key: 'value' },
  sort: 'name',
  fields: { key: 'value' },
  params: [{ key: 'key', value: 'value' }],
  skipCache: true,
});

store.removeOne(Comment, {
  headers: {},
  include: ['author'],
  filter: { key: 'value' },
  sort: 'name',
  fields: { key: 'value' },
  params: [{ key: 'key', value: 'value' }],
  skipCache: true,
});

store.removeAll(Comment, {
  headers: {},
  include: ['author'],
  filter: { key: 'value' },
  sort: 'name',
  fields: { key: 'value' },
  params: [{ key: 'key', value: 'value' }],
  skipCache: true,
});

comment.save({
  headers: {},
  include: ['author'],
  filter: { key: 'value' },
  sort: 'name',
  fields: { key: 'value' },
  params: [{ key: 'key', value: 'value' }],
  skipCache: true,
});

comment.destroy({
  headers: {},
  include: ['author'],
  filter: { key: 'value' },
  sort: 'name',
  fields: { key: 'value' },
  params: [{ key: 'key', value: 'value' }],
  skipCache: true,
});

view.getOne(1, {
  headers: {},
  include: ['author'],
  filter: { key: 'value' },
  sort: 'name',
  fields: { key: 'value' },
  params: [{ key: 'key', value: 'value' }],
  skipCache: true,
});

view.getAll({
  headers: {},
  include: ['author'],
  filter: { key: 'value' },
  sort: 'name',
  fields: { key: 'value' },
  params: [{ key: 'key', value: 'value' }],
  skipCache: true,
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
