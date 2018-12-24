import * as fetch from 'isomorphic-fetch';

// tslint:disable:no-string-literal

import {
  config,
  IJsonapiModel,
  IPageInfo,
  Response,
} from '../../src';

import {clearAllCache} from '../../src/cache';
import mockApi from '../utils/api';
import {Event, TestStore} from '../utils/setup';

const baseTransformRequest = config.transformRequest;
const baseTransformResponse = config.transformResponse;

describe('Pagination', () => {
  beforeEach(() => {
    config.fetchReference = fetch;
    // tslint:disable-next-line:no-http-string
    config.baseUrl = 'http://example.com/';
    config.transformRequest = baseTransformRequest;
    config.transformResponse = baseTransformResponse;
    config.getPaginationParams = undefined;
    config.pageInfoParser = undefined;
    clearAllCache();
  });

  it('should fetch correct page', async () => {
    config.defaultPerPage = 4;
    config.getPaginationParams = (pageNumber, pageSize) => {
      return [
        `page[number]=${pageNumber}`,
        `page[size]=${pageSize}`,
      ];
    };

    // tslint:disable-next-line:only-arrow-functions
    config.pageInfoParser = function<T extends IJsonapiModel>(_response: Response<T>): IPageInfo | null {
      return {
        currentPage: 3,
      };
    };

    mockApi({
      name: 'events-1',
      query: {page: {number: '2', size: '4'}},
      url: 'event',
    });

    const store = new TestStore();
    const events = await store.fetchPage(Event, 2);

    expect(events.data).toBeInstanceOf(Array);
    expect(events.data).toHaveLength(4);
    expect(events.pageInfo).not.toBeNull();
    if (events.pageInfo) {
      expect(events.pageInfo.currentPage).toEqual(3);
    }
  });

  it('should fail if no getPaginationParams defined', async () => {
    config.defaultPerPage = 4;
    config.getPaginationParams = undefined;

    // tslint:disable-next-line:only-arrow-functions
    config.pageInfoParser = function<T extends IJsonapiModel>(_response: Response<T>): IPageInfo | null {
      return {
        currentPage: 3,
      };
    };

    const store = new TestStore();
    expect(() => store.fetchPage(Event, 2))
      .toThrowError('Implement `config.getPaginationParams` before using `fetchPage`');
  });

  it('should fetch correct next page', async () => {
    config.defaultPerPage = 4;
    config.getPaginationParams = (pageNumber, pageSize) => {
      return [
        `page[number]=${pageNumber}`,
        `page[size]=${pageSize}`,
      ];
    };

    // tslint:disable-next-line:only-arrow-functions
    config.pageInfoParser = function<T extends IJsonapiModel>(_response: Response<T>): IPageInfo | null {
      return {
        currentPage: 2,
        pageSize: 4,
        totalPages: 5,
      };
    };

    mockApi({
      name: 'events-2',
      query: {page: {number: '2', size: '4'}},
      url: 'event',
    });

    const store = new TestStore();
    const events = await store.fetchPage(Event, 2);

    expect(events.data).toBeInstanceOf(Array);
    expect(events.data).toHaveLength(2);
    expect(events.pageInfo).not.toBeNull();
    if (events.pageInfo) {
      expect(events.pageInfo.currentPage).toEqual(2);
    }

    const nextReq = mockApi({
      name: 'events-2',
      query: {page: {number: '3', size: '4'}},
      url: 'event',
    });

    const events2 = await events.next;
    expect(events2).toBeInstanceOf(Response);
    expect(nextReq.isDone()).toBe(true);
  });

  it('should fetch correct prev page', async () => {
    config.defaultPerPage = 4;
    config.getPaginationParams = (pageNumber, pageSize) => {
      return [
        `page[number]=${pageNumber}`,
        `page[size]=${pageSize}`,
      ];
    };

    // tslint:disable-next-line:only-arrow-functions
    config.pageInfoParser = function<T extends IJsonapiModel>(_response: Response<T>): IPageInfo | null {
      return {
        currentPage: 2,
        pageSize: 4,
        totalPages: 5,
      };
    };

    mockApi({
      name: 'events-1',
      query: {page: {number: '2', size: '4'}},
      url: 'event',
    });

    const store = new TestStore();
    const events = await store.fetchPage(Event, 2);

    expect(events.data).toBeInstanceOf(Array);
    expect(events.data).toHaveLength(4);
    expect(events.pageInfo).not.toBeNull();
    if (events.pageInfo) {
      expect(events.pageInfo.currentPage).toEqual(2);
    }

    const nextReq = mockApi({
      name: 'events-2',
      query: {page: {number: '1', size: '4'}},
      url: 'event',
    });

    const events2 = await events.prev;
    expect(events2).toBeInstanceOf(Response);
    expect(nextReq.isDone()).toBe(true);
  });

  it('should fetch correct first page', async () => {
    config.defaultPerPage = 4;
    config.getPaginationParams = (pageNumber, pageSize) => {
      return [
        `page[number]=${pageNumber}`,
        `page[size]=${pageSize}`,
      ];
    };

    // tslint:disable-next-line:only-arrow-functions
    config.pageInfoParser = function<T extends IJsonapiModel>(_response: Response<T>): IPageInfo | null {
      return {
        currentPage: 2,
        pageSize: 4,
        totalPages: 5,
      };
    };

    mockApi({
      name: 'events-2',
      query: {page: {number: '2', size: '4'}},
      url: 'event',
    });

    const store = new TestStore();
    const events = await store.fetchPage(Event, 2);

    expect(events.data).toBeInstanceOf(Array);
    expect(events.data).toHaveLength(2);
    expect(events.pageInfo).not.toBeNull();
    if (events.pageInfo) {
      expect(events.pageInfo.currentPage).toEqual(2);
    }

    const nextReq = mockApi({
      name: 'events-2',
      query: {page: {number: '1', size: '4'}},
      url: 'event',
    });

    const events2 = await events.first;
    expect(events2).toBeInstanceOf(Response);
    expect(nextReq.isDone()).toBe(true);
  });

  it('should fetch correct last page', async () => {
    config.defaultPerPage = 4;
    config.getPaginationParams = (pageNumber, pageSize) => {
      return [
        `page[number]=${pageNumber}`,
        `page[size]=${pageSize}`,
      ];
    };

    // tslint:disable-next-line:only-arrow-functions
    config.pageInfoParser = function<T extends IJsonapiModel>(_response: Response<T>): IPageInfo | null {
      return {
        currentPage: 2,
        pageSize: 4,
        totalPages: 5,
      };
    };

    mockApi({
      name: 'events-2',
      query: {page: {number: '2', size: '4'}},
      url: 'event',
    });

    const store = new TestStore();
    const events = await store.fetchPage(Event, 2);

    expect(events.data).toBeInstanceOf(Array);
    expect(events.data).toHaveLength(2);
    expect(events.pageInfo).not.toBeNull();
    if (events.pageInfo) {
      expect(events.pageInfo.currentPage).toEqual(2);
    }

    const nextReq = mockApi({
      name: 'events-2',
      query: {page: {number: '5', size: '4'}},
      url: 'event',
    });

    const events2 = await events.last;
    expect(events2).toBeInstanceOf(Response);
    expect(nextReq.isDone()).toBe(true);
  });

  it('should not have links if no page info', async () => {
    config.defaultPerPage = 4;
    config.getPaginationParams = (pageNumber, pageSize) => {
      return [
        `page[number]=${pageNumber}`,
        `page[size]=${pageSize}`,
      ];
    };
    mockApi({
      name: 'events-2',
      query: {page: {number: '2', size: '4'}},
      url: 'event',
    });

    const store = new TestStore();
    const events = await store.fetchPage(Event, 2);

    expect(events.data).toBeInstanceOf(Array);
    expect(events.data).toHaveLength(2);
    expect(events.pageInfo).toBeNull();
    expect(events.first).toBeUndefined();
    expect(events.last).toBeUndefined();
    expect(events.next).toBeUndefined();
  });

  it('should throw if pagination on single item', async () => {
    config.defaultPerPage = 4;
    config.getPaginationParams = (pageNumber, pageSize) => {
      return [
        `page[number]=${pageNumber}`,
        `page[size]=${pageSize}`,
      ];
    };

    // tslint:disable-next-line:only-arrow-functions
    config.pageInfoParser = function<T extends IJsonapiModel>(_response: Response<T>): IPageInfo | null {
      return {
        currentPage: 2,
        pageSize: 4,
        totalPages: 5,
      };
    };

    mockApi({
      name: 'event-1',
      query: {page: {number: '2', size: '4'}},
      url: 'event',
    });

    const store = new TestStore();
    const events = await store.fetchPage(Event, 2);

    expect(events.pageInfo).not.toBeNull();
    if (events.pageInfo) {
      expect(events.pageInfo.currentPage).toEqual(2);
    }

    expect(() => events.next).toThrowError('Can\'t determine the response type');
  });

  it('should throw if not enough page info', async () => {
    config.defaultPerPage = 4;
    config.getPaginationParams = (pageNumber, pageSize) => {
      return [
        `page[number]=${pageNumber}`,
        `page[size]=${pageSize}`,
      ];
    };

    // tslint:disable-next-line:only-arrow-functions
    config.pageInfoParser = function<T extends IJsonapiModel>(_response: Response<T>): IPageInfo | null {
      return {
        currentPage: 2,
        pageSize: 4,
      };
    };

    mockApi({
      name: 'events-2',
      query: {page: {number: '2', size: '4'}},
      url: 'event',
    });

    const store = new TestStore();
    const events = await store.fetchPage(Event, 2);

    expect(events.data).toBeInstanceOf(Array);
    expect(events.data).toHaveLength(2);
    expect(events.pageInfo).not.toBeNull();
    if (events.pageInfo) {
      expect(events.pageInfo.currentPage).toEqual(2);
    }

    expect(() => events.next).toThrowError('Not enough info in `pageInfo`');
  });

  it('should resolve to undefined if no next page', async () => {
    config.defaultPerPage = 4;
    config.getPaginationParams = (pageNumber, pageSize) => {
      return [
        `page[number]=${pageNumber}`,
        `page[size]=${pageSize}`,
      ];
    };

    // tslint:disable-next-line:only-arrow-functions
    config.pageInfoParser = function<T extends IJsonapiModel>(_response: Response<T>): IPageInfo | null {
      return {
        currentPage: 2,
        pageSize: 4,
        totalPages: 2,
      };
    };

    mockApi({
      name: 'events-2',
      query: {page: {number: '2', size: '4'}},
      url: 'event',
    });

    const store = new TestStore();
    const events = await store.fetchPage(Event, 2);

    expect(events.data).toBeInstanceOf(Array);
    expect(events.data).toHaveLength(2);
    expect(events.pageInfo).not.toBeNull();
    if (events.pageInfo) {
      expect(events.pageInfo.currentPage).toEqual(2);
    }

    const resp2 = await events.next;
    expect(resp2).not.toBeUndefined();
    if (resp2) {
      expect(resp2.data).toBeNull();
    }
  });
});
