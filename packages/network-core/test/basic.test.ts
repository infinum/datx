import { Collection, PureCollection, Model } from '@datx/core';
import {
  HttpClientTestingModule,
  HttpTestingController,
  TestRequest,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import fetch from 'node-fetch';
import { Network, Client, Request, Response } from '../src';
import { MockQueryBuilder } from './mock/MockQueryBuilder';

describe('Request', () => {
  describe('Init', () => {
    it('should initialize', () => {
      const network = new Network.Promise(fetch);
      const collection = new Collection();
      const client = new Client({
        collection,
        network,
        // @ts-ignore
        QueryBuilder: MockQueryBuilder,
        request: Request,
      });
      expect(client).toBeTruthy();
    });

    it('should throw if no url is set', async () => {
      const network = new Network.Promise(fetch);
      const collection = new Collection();
      const client = new Client({
        collection,
        network,
        // @ts-ignore
        QueryBuilder: MockQueryBuilder,
        request: Request,
      });
      expect(() => client.from(Model).buildRequest()).toThrowError('URL should be defined');
    });

    it('should not throw if baseUrl is set', async () => {
      const network = new Network.Promise(fetch);
      const collection = new Collection();
      const client = new Client({
        collection,
        network,
        // @ts-ignore
        QueryBuilder: MockQueryBuilder,
        request: Request,
        baseUrl: 'https://example.com',
      });
      expect(client.from(Model).buildRequest()).toBeInstanceOf(Request);
    });

    it('should not throw if type is set', async () => {
      const network = new Network.Promise(fetch);
      const collection = new Collection();
      const client = new Client({
        collection,
        network,
        // @ts-ignore
        QueryBuilder: MockQueryBuilder,
        request: Request,
      });
      class TestModel extends Model {
        static type = 'test';
      }
      expect(client.from(TestModel).buildRequest()).toBeInstanceOf(Request);
    });
  });

  describe('MockPromiseNetwork tests', () => {
    it('should work with the MockPromiseNetwork', async () => {
      const network = new Network.Mock.Promise();
      const collection = new Collection();
      network.setAssertion((url, _options) => {
        expect(url).toBe('test-endpoint');
        return Promise.resolve([{ foo: 123 }]);
      });
      const client = new Client({
        collection,
        network,
        // @ts-ignore
        QueryBuilder: MockQueryBuilder,
        request: Request,
      });
      class TestModel extends Model {
        static endpoint = 'test-endpoint';

        public foo!: number;
      }
      const resp = await client.from(TestModel).buildRequest().fetch();
      expect(resp).toBeInstanceOf(Response);
    });

    it('should work with the MockPromiseNetwork and no collection', async () => {
      const network = new Network.Mock.Promise();
      network.setAssertion((url, _options) => {
        expect(url).toBe('test-endpoint');
        return Promise.resolve([
          [{ foo: 123 }],
          { headers: { 'content-type': 'application/json' } },
        ]);
      });
      const client = new Client({
        network,
        // @ts-ignore
        QueryBuilder: MockQueryBuilder,
        request: Request,
      });
      class TestModel extends Model {
        static endpoint = 'test-endpoint';

        public foo!: number;
      }
      const resp = await client.from(TestModel).buildRequest().fetch();
      expect(resp).toBeInstanceOf(Response);
      expect(resp.data[0]?.foo).toBe(123);
      expect(resp.collection).toBeInstanceOf(PureCollection);
      expect(resp.collection.length).toBe(1);
      expect(resp.collection.findAll(TestModel)).toHaveLength(1);
    });

    it('should work with the MockPromiseNetwork and collection', async () => {
      const network = new Network.Mock.Promise();
      const collection = new Collection();
      network.setAssertion((url, _options) => {
        expect(url).toBe('test-endpoint');
        return Promise.resolve([
          [{ foo: 123 }],
          { headers: { 'content-type': 'application/json' } },
        ]);
      });
      const client = new Client({
        collection,
        network,
        // @ts-ignore
        QueryBuilder: MockQueryBuilder,
        request: Request,
      });
      class TestModel extends Model {
        static endpoint = 'test-endpoint';

        public foo!: number;
      }
      const resp = await client.from(TestModel).buildRequest().fetch();
      expect(resp).toBeInstanceOf(Response);
      expect(resp.data[0]?.foo).toBe(123);
      expect(resp.collection).toBe(collection);
      expect(resp.collection.length).toBe(1);
      expect(resp.collection.findAll(TestModel)).toHaveLength(1);
    });

    it('should work with the MockPromiseNetwork fromInstance instance', async () => {
      const network = new Network.Mock.Promise();
      const collection = new Collection();
      network.setAssertion((url, _options) => {
        expect(url).toBe('test-endpoint');
        return Promise.resolve([{ foo: 123 }, { headers: { 'content-type': 'application/json' } }]);
      });
      const client = new Client({
        collection,
        network,
        // @ts-ignore
        QueryBuilder: MockQueryBuilder,
        request: Request,
      });
      class TestModel extends Model {
        static endpoint = 'test-endpoint';

        public foo!: number;
      }
      const resp = await client.fromInstance(new TestModel()).buildRequest().fetch();
      expect(resp).toBeInstanceOf(Response);
      expect(resp.data?.foo).toBe(123);
      expect(resp.collection).toBe(collection);
      expect(resp.collection.length).toBe(1);
      expect(resp.collection.findAll(TestModel)).toHaveLength(1);
    });

    it('should work with the MockPromiseNetwork fromInstance id', async () => {
      const network = new Network.Mock.Promise();
      const collection = new Collection();
      network.setAssertion((url, _options) => {
        expect(url).toBe('test-endpoint');
        return Promise.resolve([{ foo: 123 }, { headers: { 'content-type': 'application/json' } }]);
      });
      const client = new Client({
        collection,
        network,
        // @ts-ignore
        QueryBuilder: MockQueryBuilder,
        request: Request,
      });
      class TestModel extends Model {
        static endpoint = 'test-endpoint';

        public foo!: number;
      }
      const resp = await client.fromInstance(TestModel, '1').buildRequest().fetch();
      expect(resp).toBeInstanceOf(Response);
      expect(resp.data?.foo).toBe(123);
      expect(resp.collection).toBe(collection);
      expect(resp.collection.length).toBe(1);
      expect(resp.collection.findAll(TestModel)).toHaveLength(1);
    });

    it('should work with the MockPromiseNetwork with id', async () => {
      const network = new Network.Mock.Promise();
      const collection = new Collection();
      network.setAssertion((url, _options) => {
        expect(url).toBe('test-endpoint');
        return Promise.resolve([{ foo: 123 }, { headers: { 'content-type': 'application/json' } }]);
      });
      const client = new Client({
        collection,
        network,
        // @ts-ignore
        QueryBuilder: MockQueryBuilder,
        request: Request,
      });
      class TestModel extends Model {
        static endpoint = 'test-endpoint';

        public foo!: number;
      }
      const resp = await client.from(TestModel).id('1').buildRequest().fetch();
      expect(resp).toBeInstanceOf(Response);
      expect(resp.data?.foo).toBe(123);
      expect(resp.collection).toBe(collection);
      expect(resp.collection.length).toBe(1);
      expect(resp.collection.findAll(TestModel)).toHaveLength(1);
    });
  });

  describe('RxNetwork mocking tests', () => {
    xit('should work with mocked RxNetwork', (done: jest.DoneCallback) => {
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
      });
      const httpMock = TestBed.inject(HttpClient);
      const controller = TestBed.inject(HttpTestingController);
      controller.match('').forEach((req: TestRequest) => {
        console.log(req);
      });
      // controller.expectOne('http://example.com/test-endpoint').flush([{ foo: 123 }]);
      const network = new Network.Rx(httpMock);
      const client = new Client({
        network,
        // @ts-ignore
        QueryBuilder: MockQueryBuilder,
        request: Request,
        baseUrl: 'http://example.com/test-endpoint',
      });
      class TestModel extends Model {
        public foo!: number;
      }
      client
        .from(TestModel)
        .buildRequest()
        .fetch()
        .subscribe((resp) => {
          expect(resp).toBeInstanceOf(Response);
          expect(resp.data[0]?.foo).toBe(123);
          expect(resp.collection).toBeInstanceOf(PureCollection);
          expect(resp.collection.length).toBe(1);
          expect(resp.collection.findAll(TestModel)).toHaveLength(1);
          controller.verify();
          done();
        });
    });
  });

  // it('throw on server error', async () => {
  //   const network = new Network.Promise(fetch);
  //   const collection = new Collection();
  //   const client = new Client({ collection, network, QueryBuilder: MockQueryBuilder, request: Request });
  //   client.request.update(setUrl('/'));
  //   nock('http://example.com').get('/').reply(404, {});

  //   try {
  //     await client.request.fetch();
  //     expect(true).toBe(false);
  //   } catch (e) {
  //     expect(collection.length).toBe(0);
  //     expect(e).toBeInstanceOf(Response);
  //     expect(e.error).toEqual({ message: 'Invalid HTTP status: 404', status: 404 });
  //   }
  // });

  // it('throw on non-json error response', async () => {
  //   const network = new Network.Promise(fetch);
  //   const collection = new Collection();
  //   const client = new Client({ collection, network });
  //   client.request.update(setUrl('/'));
  //   nock('http://example.com').get('/').reply(404, 'Not found');

  //   try {
  //     await client.request.fetch();
  //     expect(true).toBe(false);
  //   } catch (e) {
  //     expect(collection.length).toBe(0);
  //     expect(e).toBeInstanceOf(Response);
  //     expect(e.error).toEqual({ message: 'Invalid HTTP status: 404', status: 404 });
  //   }
  // });

  // it('throw on non-json success response', async () => {
  //   const network = new Network.Promise(fetch);
  //   const collection = new Collection();
  //   const client = new Client({ collection, network, QueryBuilder: MockQueryBuilder, request: Request });
  //   client.request.update(setUrl('/'));
  //   nock('http://example.com').get('/').reply(200, 'Not valid JSON');

  //   try {
  //     await client.request.fetch();
  //     expect(true).toBe(false);
  //   } catch (e) {
  //     expect(collection.length).toBe(0);
  //     expect(e).toBeInstanceOf(Response);
  //     expect(e.error).toEqual({
  //       message: 'The response is in an unexpected format',
  //       status: 200,
  //     });
  //   }
  // });
});
