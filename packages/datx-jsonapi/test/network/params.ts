import * as fetch from 'isomorphic-fetch';

import { config, ParamArrayType } from '../../src';

import { clearAllCache } from '../../src/cache';
import mockApi from '../utils/api';
import { Event, TestStore } from '../utils/setup';

describe('params', () => {
  beforeEach(() => {
    config.fetchReference = fetch;
    config.baseUrl = 'https://example.com/';
    clearAllCache();
  });

  it('should support basic filtering', async () => {
    mockApi({
      name: 'events-1',
      query: { filter: { name: 'foo' } },
      url: 'event',
    });

    const store = new TestStore();
    const events = await store.fetchAll('event', { queryParams: { filter: { name: 'foo' } } });

    expect(events.data).toBeInstanceOf(Array);
    expect(events.data).toHaveLength(4);
  });

  it('should support advanced filtering', async () => {
    mockApi({
      name: 'events-1',
      query: { filter: { 'bar.id': '2', name: 'foo' } },
      url: 'event',
    });

    const store = new TestStore();
    const events = await store.fetchAll('event', {
      queryParams: { filter: { name: 'foo', bar: { id: '2' } } },
    });

    expect(events.data).toBeInstanceOf(Array);
    expect(events.data).toHaveLength(4);
  });

  it('should support sorting', async () => {
    mockApi({
      name: 'events-1',
      query: { sort: 'name' },
      url: 'event',
    });

    const store = new TestStore();
    const events = await store.fetchAll('event', { queryParams: { sort: 'name' } });

    expect(events.data).toBeInstanceOf(Array);
    expect(events.data).toHaveLength(4);
  });

  it('should support advanced sorting', async () => {
    mockApi({
      name: 'events-1',
      query: { sort: '-name,bar.id' },
      url: 'event',
    });

    const store = new TestStore();
    const events = await store.fetchAll('event', { queryParams: { sort: ['-name', 'bar.id'] } });

    expect(events.data).toBeInstanceOf(Array);
    expect(events.data).toHaveLength(4);
  });

  it('should support inclusion of related resources', async () => {
    mockApi({
      name: 'events-1',
      query: { include: 'bar' },
      url: 'event',
    });

    const store = new TestStore();
    const events = await store.fetchAll('event', { queryParams: { include: 'bar' } });

    expect(events.data).toBeInstanceOf(Array);
    expect(events.data).toHaveLength(4);
  });

  it('should support advanced inclusion of related resources', async () => {
    mockApi({
      name: 'events-1',
      query: { include: 'bar,bar.baz' },
      url: 'event',
    });

    const store = new TestStore();
    const events = await store.fetchAll('event', { queryParams: { include: ['bar', 'bar.baz'] } });

    expect(events.data).toBeInstanceOf(Array);
    expect(events.data).toHaveLength(4);
  });

  it('should support inclusion of related resources on save', async () => {
    mockApi({
      method: 'POST',
      name: 'event-1',
      query: { include: 'bar' },
      url: 'event',
    });

    const store = new TestStore();
    const event = store.add({}, Event);
    await event.save({ queryParams: { include: 'bar' } });
  });

  it('should support sparse fields', async () => {
    mockApi({
      name: 'events-1',
      query: { fields: { foo: 'name', bar: 'name' } },
      url: 'event',
    });

    const store = new TestStore();
    const events = await store.fetchAll('event', {
      queryParams: { fields: { foo: 'name', bar: 'name' } },
    });

    expect(events.data).toBeInstanceOf(Array);
    expect(events.data).toHaveLength(4);
  });

  it('should support advanced sparse fields', async () => {
    mockApi({
      name: 'events-1',
      query: { fields: { foo: 'name', bar: 'name', 'bar.baz': 'foo,bar' } },
      url: 'event',
    });

    const store = new TestStore();
    const events = await store.fetchAll('event', {
      queryParams: {
        fields: {
          bar: 'name',
          'bar.baz': ['foo', 'bar'],
          foo: 'name',
        },
      },
    });

    expect(events.data).toBeInstanceOf(Array);
    expect(events.data).toHaveLength(4);
  });

  it('should support raw params', async () => {
    mockApi({
      name: 'events-1',
      query: { a: '1', b: '2', c: '3', sort: 'name' },
      url: 'event',
    });

    const store = new TestStore();
    const events = await store.fetchAll('event', {
      queryParams: {
        custom: ['a=1', 'b=2', { key: 'c', value: '3' }],
        sort: 'name',
      },
    });

    expect(events.data).toBeInstanceOf(Array);
    expect(events.data).toHaveLength(4);
  });

  describe('Param array types', () => {
    afterEach(() => {
      config.paramArrayType = ParamArrayType.COMMA_SEPARATED;
    });

    it('should work with coma separated values', async () => {
      mockApi({
        name: 'events-1',
        query: { filter: { a: '1,2', b: '3' } },
        url: 'event',
      });

      config.paramArrayType = ParamArrayType.COMMA_SEPARATED;
      const store = new TestStore();
      const events = await store.fetchAll('event', {
        queryParams: { filter: { a: ['1', '2'], b: '3' } },
      });

      expect(events.data).toBeInstanceOf(Array);
      expect(events.data).toHaveLength(4);
    });

    it('should work with multiple params', async () => {
      mockApi({
        name: 'events-1',
        query: { filter: { a: ['1', '2'], b: '3' } },
        url: 'event',
      });

      config.paramArrayType = ParamArrayType.MULTIPLE_PARAMS;
      const store = new TestStore();
      const events = await store.fetchAll('event', {
        queryParams: { filter: { a: ['1', '2'], b: '3' } },
      });

      expect(events.data).toBeInstanceOf(Array);
      expect(events.data).toHaveLength(4);
    });

    it('should work with multiple params', async () => {
      mockApi({
        name: 'events-1',
        query: { filter: { 'a.0': '1', 'a.1': '2', b: '3' } },
        url: 'event',
      });

      config.paramArrayType = ParamArrayType.OBJECT_PATH;
      const store = new TestStore();
      const events = await store.fetchAll('event', {
        queryParams: { filter: { a: ['1', '2'], b: '3' } },
      });

      expect(events.data).toBeInstanceOf(Array);
      expect(events.data).toHaveLength(4);
    });

    it('should work with multiple params', async () => {
      mockApi({
        name: 'events-1',
        query: { filter: { a: ['1', '2'], b: '3' } },
        url: 'event',
      });

      config.paramArrayType = ParamArrayType.PARAM_ARRAY;
      const store = new TestStore();
      const events = await store.fetchAll('event', {
        queryParams: { filter: { a: ['1', '2'], b: '3' } },
      });

      expect(events.data).toBeInstanceOf(Array);
      expect(events.data).toHaveLength(4);
    });
  });

  it('should support request params', async () => {
    mockApi({
      name: 'events-1',
      query: { filter: { name: 'foo' } },
      url: 'event',
    });

    const store = new TestStore();
    const events = await store.request('event', 'GET', undefined, {
      queryParams: { filter: { name: 'foo' } },
    });

    expect(events.data).toBeInstanceOf(Array);
    expect(events.data).toHaveLength(4);
  });

  it('should support request params with other params', async () => {
    mockApi({
      name: 'events-1',
      query: { filter: { name: 'foo' }, foo: '1' },
      url: 'event',
    });

    const store = new TestStore();
    const events = await store.request('event?foo=1', 'GET', undefined, {
      queryParams: { filter: { name: 'foo' } },
    });

    expect(events.data).toBeInstanceOf(Array);
    expect(events.data).toHaveLength(4);
  });

  describe('query string encoding', () => {
    afterEach(() => {
      config.encodeQueryString = false;
    });

    it("shouldn't encode params by default", async () => {
      mockApi({
        name: 'events-1',
        query: false,
        url: 'event?filter[name]=ć',
      });

      const store = new TestStore();
      await store.request('event', 'GET', undefined, { queryParams: { filter: { name: 'ć' } } });
    });

    it('should encode params when enabled', async () => {
      config.encodeQueryString = true;

      mockApi({
        name: 'events-1',
        query: false,
        url: 'event?filter%5Bname%5D=%C4%87%3D',
      });

      const store = new TestStore();
      await store.request('event', 'GET', undefined, { queryParams: { filter: { name: 'ć=' } } });
    });
  });
});
