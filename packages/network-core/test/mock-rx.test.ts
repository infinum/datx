import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Model, PureCollection } from '@datx/core';
import { Network, Client, Request, Response } from '../src';
import { MockQueryBuilder } from './mock/MockQueryBuilder';

describe('RxNetwork mocking tests', () => {
  it('should work with mocked RxNetwork', () => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    const httpMock = TestBed.inject(HttpClient);
    const controller = TestBed.inject(HttpTestingController);
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

    const callbacks = {
      next: jest.fn(),
      complete: jest.fn(),
      error: jest.fn(),
    };
    const request$ = client.from(TestModel).buildRequest().fetch();
    const sub = request$.subscribe(callbacks);

    const requests = controller.match('http://example.com/test-endpoint');
    expect(requests.length).toBeTruthy();

    requests[0]?.flush(
      new HttpResponse({
        status: 200,
        headers: new HttpHeaders(),
        body: { foo: 321 },
      }),
    );

    expect(callbacks.next).toHaveBeenCalledTimes(1);
    expect(callbacks.next.mock.calls[0][0]).toBeInstanceOf(Response);
    expect(callbacks.next.mock.calls[0][0].data?.foo).toBe(321);
    expect(callbacks.next.mock.calls[0][0].collection).toBeInstanceOf(PureCollection);
    expect(callbacks.next.mock.calls[0][0].collection.length).toBe(1);
    expect(callbacks.next.mock.calls[0][0].collection.findAll(TestModel)).toHaveLength(1);

    expect(callbacks.complete).toHaveBeenCalled();
    expect(callbacks.error).not.toHaveBeenCalled();

    sub.unsubscribe();
    controller.verify();
  });
});
