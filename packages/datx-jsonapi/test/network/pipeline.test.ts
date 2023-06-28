import * as fs from 'fs';
import { MockBaseRequest } from '../utils/MockBaseRequest';
import { filter, sort, Direction, page, include, sparse } from '../../src/operators';
import { setUrl, collection } from '../../src';
import { TestStore, Event, Image } from '../utils/setup';

describe('pipeline', () => {
  it('should work for a basic filter', async () => {
    const request = new MockBaseRequest('foobar').pipe(setUrl('/test'), filter({ test: '123' }));

    await request.fetch();
    expect(request['lastUrl']).toBe('foobar/test?filter[test]=123');
  });

  it('should work for a complex filter', async () => {
    const request = new MockBaseRequest('foobar').pipe(
      setUrl('/test'),
      filter({ test: '123', foo: { bar: '321', baz: '456' } }),
    );

    await request.fetch();
    expect(request['lastUrl']).toBe(
      'foobar/test?filter[test]=123&filter[foo][bar]=321&filter[foo][baz]=456',
    );
  });

  it('should work for sorting', async () => {
    const request = new MockBaseRequest('foobar').pipe(
      setUrl('/test'),
      sort('foo', ['bar', Direction.Asc], ['baz', Direction.Desc]),
    );

    await request.fetch();
    expect(request['lastUrl']).toBe('foobar/test?sort=foo,bar,-baz');
  });

  it('should work for pagination', async () => {
    const request = new MockBaseRequest('foobar').pipe(
      setUrl('/test'),
      page({ size: '123', offset: '0' }),
    );

    await request.fetch();
    expect(request['lastUrl']).toBe('foobar/test?page[size]=123&page[offset]=0');
  });

  it('should work for include', async () => {
    const request = new MockBaseRequest('foobar').pipe(setUrl('/test'), include('foo', 'bar.baz'));

    await request.fetch();
    expect(request['lastUrl']).toBe('foobar/test?include=foo,bar.baz');
  });

  it('should work for sparse fields', async () => {
    const request = new MockBaseRequest('foobar').pipe(
      setUrl('/test'),
      sparse({ foo: ['a', 'b'], bar: ['baz'] }),
    );

    await request.fetch();
    expect(request['lastUrl']).toBe('foobar/test?fields[foo]=a,b&fields[bar]=baz');
  });

  it('should parse data correctly', async () => {
    const store = new TestStore();

    const request = new MockBaseRequest('foobar').pipe<Event>(
      collection(store),
      setUrl('/events/12345'),
    );
    const mockEventWithRelationships = JSON.parse(
      fs.readFileSync('./test/mock/event-1f.json', 'utf-8'),
    );

    request['resetMock']({ status: 200, json: async () => mockEventWithRelationships });

    const response = await request.fetch();

    expect(response.data).toBeInstanceOf(Event);
    expect(response.data?.images).toHaveLength(2);
    expect(response.data?.images[0]).toBeInstanceOf(Image);
  });
});
