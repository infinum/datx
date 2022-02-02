import { HttpClient } from '@angular/common/http';
import {
  HttpClientTestingModule,
  HttpTestingController,
  TestRequest,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Model, PureCollection } from '@datx/core';
import { Network, Client, Request, Response } from '../src';
import { MockQueryBuilder } from './mock/MockQueryBuilder';

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
      QueryBuilder: MockQueryBuilder,
      request: Request,
      options: {
        baseUrl: 'http://example.com/test-endpoint',
      },
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
        expect(resp.data?.[0]?.foo).toBe(123);
        expect(resp.collection).toBeInstanceOf(PureCollection);
        expect(resp.collection.length).toBe(1);
        expect(resp.collection.findAll(TestModel)).toHaveLength(1);
        controller.verify();
        done();
      });
  });
});
