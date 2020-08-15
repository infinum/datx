import { MockBaseRequest } from './mock/MockBaseRequest';
import {
  addInterceptor,
  setUrl,
  fetchReference,
  collection,
  parser,
  method,
  HttpMethod,
  body,
  serializer,
} from '../src';
import { PureModel, Attribute, Collection } from 'datx';
import { clearAllCache } from '../src/cache';

describe('Request', () => {
  it('should initialize', () => {
    const request = new MockBaseRequest('foobar');
    expect(request).toBeTruthy();
    expect(request['_config'].baseUrl).toBe('foobar');
    expect(request['_config'].maxCacheAge).toBe(Infinity);
    expect(request).toBeInstanceOf(MockBaseRequest);
  });

  it('throw if no url is set', async () => {
    const request = new MockBaseRequest('foobar');
    try {
      await request.fetch();
      expect(true).toBe(false);
    } catch (e) {
      expect(e).toEqual(new Error('URL should be defined'));
    }
  });

  it('throw on server error', async () => {
    const request = new MockBaseRequest('foobar').pipe(setUrl('foobar'));
    request['resetMock']({
      status: 404,
      json: async () => ({}),
    });
    try {
      await request.fetch();
      expect(true).toBe(false);
    } catch (e) {
      expect(e.error).toEqual({ message: 'Invalid HTTP status: 404', status: 404 });
    }
  });

  it('should clone the request', () => {
    class FooRequest extends MockBaseRequest {}
    const request1 = new MockBaseRequest('foobar');
    const request2 = request1.clone(FooRequest as any);
    const request3 = request1.pipe();

    expect(request1).not.toBe(request2);
    expect(request1['_config']).not.toBe(request2['_config']);

    expect(request1).not.toBe(request3);
    expect(request1['_config']).not.toBe(request3['_config']);

    expect(request3).not.toBe(request2);
    expect(request3['_config']).not.toBe(request2['_config']);

    expect(request1).toBeInstanceOf(MockBaseRequest);
    expect(request1).not.toBeInstanceOf(FooRequest);

    expect(request2).toBeInstanceOf(MockBaseRequest);
    expect(request2).toBeInstanceOf(FooRequest);

    expect(request3).toBeInstanceOf(MockBaseRequest);
    expect(request3).not.toBeInstanceOf(FooRequest);
  });

  it('should run the pipes in the right order', () => {
    const request1 = new MockBaseRequest('foobar');

    const request2 = request1.pipe(setUrl('foo'), setUrl('bar'));

    expect(request1['_options'].url).toBe(undefined);
    expect(request2['_options'].url).toBe('bar');
  });

  it('should call interceptors in the correct order', async () => {
    let counter = 0;

    function mockInterceptor(expected: number) {
      return async (options: any, next: any): Promise<any> => {
        expect(counter).toBe(expected);
        counter++;
        return next(options);
      };
    }

    const request1 = new MockBaseRequest('foobar');

    const request2 = request1.pipe(
      setUrl('foobar'),
      addInterceptor(mockInterceptor(0)),
      addInterceptor(mockInterceptor(1)),
      addInterceptor(mockInterceptor(2)),
    );

    await request2.fetch();

    expect(request2['_config'].fetchReference).toHaveBeenCalledTimes(1);
    expect(request1['_config'].fetchReference).toHaveBeenCalledTimes(1);
  });

  it('should use the correct fetcher reference', async () => {
    const request1 = new MockBaseRequest('foobar');

    const request2 = request1.pipe(
      setUrl('foobar'),
      fetchReference(
        jest.fn().mockResolvedValue(
          Promise.resolve({
            status: 200,
            json() {
              return Promise.resolve({});
            },
          }),
        ),
      ),
    );

    await request2.fetch();

    expect(request2['_config'].fetchReference).toHaveBeenCalledTimes(1);
    expect(request1['_config'].fetchReference).toHaveBeenCalledTimes(0);
  });

  describe('model initialization', () => {
    beforeEach(() => {
      clearAllCache();
    });

    it('default - PureModel, single model', async () => {
      const request1 = new MockBaseRequest('foobar');

      const request2 = request1.pipe(
        setUrl('foobar'),
        fetchReference(
          jest.fn().mockResolvedValue(
            Promise.resolve({
              status: 200,
              json() {
                return Promise.resolve({
                  title: 'Test',
                });
              },
            }),
          ),
        ),
      );

      const response = await request2.fetch();

      expect(response.data).toBeInstanceOf(PureModel);
      expect(response.data?.['title']).toBe('Test');
    });

    it('default - PureModel, array', async () => {
      const request1 = new MockBaseRequest('foobar');

      const request2 = request1.pipe(
        setUrl('foobar'),
        fetchReference(
          jest.fn().mockResolvedValue(
            Promise.resolve({
              status: 200,
              json() {
                return Promise.resolve([
                  {
                    title: 'Test',
                  },
                ]);
              },
            }),
          ),
        ),
      );

      const response = await request2.fetch();

      expect(response.data?.[0]).toBeInstanceOf(PureModel);
      expect(response.data?.[0]['title']).toBe('Test');
    });

    it('FooModel, single model', async () => {
      const request1 = new MockBaseRequest('foobar');
      class Foo extends PureModel {
        @Attribute()
        public title!: string;
      }

      const request2 = request1.pipe<Foo>(
        setUrl('foobar', Foo),
        fetchReference(
          jest.fn().mockResolvedValue(
            Promise.resolve({
              status: 200,
              json() {
                return Promise.resolve({
                  title: 'Test',
                });
              },
            }),
          ),
        ),
      );

      const response = await request2.fetch();

      expect(response.data).toBeInstanceOf(Foo);
      expect(response.data?.title).toBe('Test');
    });

    it('FooModel, array', async () => {
      const request1 = new MockBaseRequest('foobar');
      class Foo extends PureModel {
        @Attribute()
        public title!: string;
      }

      const request2 = request1.pipe<Array<Foo>>(
        setUrl('foobar', Foo),
        fetchReference(
          jest.fn().mockResolvedValue(
            Promise.resolve({
              status: 200,
              json() {
                return Promise.resolve([
                  {
                    title: 'Test',
                  },
                ]);
              },
            }),
          ),
        ),
      );

      const response = await request2.fetch();

      expect(response.data?.[0]).toBeInstanceOf(Foo);
      expect(response.data?.[0]['title']).toBe('Test');
    });

    it('collection, single model', async () => {
      const request1 = new MockBaseRequest('foobar');
      class Foo extends PureModel {
        public static type = 'foo';

        @Attribute()
        public title!: string;
      }
      class TestStore extends Collection {
        public static types = [Foo];
      }

      const store = new TestStore();

      const request2 = request1.pipe<Foo>(
        setUrl('foobar', 'foo'),
        collection(store),
        fetchReference(
          jest.fn().mockResolvedValue(
            Promise.resolve({
              status: 200,
              json() {
                return Promise.resolve({
                  title: 'Test',
                });
              },
            }),
          ),
        ),
      );

      const response = await request2.fetch();

      expect(response.data).toBeInstanceOf(Foo);
      expect(response.data?.title).toBe('Test');
    });

    it('collection, array', async () => {
      const request1 = new MockBaseRequest('foobar');
      class Foo extends PureModel {
        public static type = 'foo';

        @Attribute()
        public title!: string;
      }
      class TestStore extends Collection {
        public static types = [Foo];
      }

      const store = new TestStore();

      const request2 = request1.pipe<Array<Foo>>(
        setUrl('foobar', 'foo'),
        collection(store),
        fetchReference(
          jest.fn().mockResolvedValue(
            Promise.resolve({
              status: 200,
              json() {
                return Promise.resolve([
                  {
                    title: 'Test',
                  },
                ]);
              },
            }),
          ),
        ),
      );

      const response = await request2.fetch();

      expect(response.data?.[0]).toBeInstanceOf(Foo);
      expect(response.data?.[0]['title']).toBe('Test');
    });

    it('collection default, single model', async () => {
      const request1 = new MockBaseRequest('foobar');
      class Foo extends PureModel {
        public static type = 'foo';

        @Attribute()
        public title!: string;
      }
      class TestStore extends Collection {
        public static types = [Foo];
      }

      const store = new TestStore();

      const request2 = request1.pipe<Foo>(
        setUrl('foobar'),
        collection(store),
        fetchReference(
          jest.fn().mockResolvedValue(
            Promise.resolve({
              status: 200,
              json() {
                return Promise.resolve({
                  title: 'Test',
                });
              },
            }),
          ),
        ),
      );

      const response = await request2.fetch();

      expect(response.data).not.toBeInstanceOf(Foo);
      expect(response.data?.title).toBe('Test');
    });

    it('collection default, array', async () => {
      const request1 = new MockBaseRequest('foobar');
      class Foo extends PureModel {
        public static type = 'foo';

        @Attribute()
        public title!: string;
      }
      class TestStore extends Collection {
        public static types = [Foo];
      }

      const store = new TestStore();

      const request2 = request1.pipe<Array<Foo>>(
        setUrl('foobar'),
        collection(store),
        fetchReference(
          jest.fn().mockResolvedValue(
            Promise.resolve({
              status: 200,
              json() {
                return Promise.resolve([
                  {
                    title: 'Test',
                  },
                ]);
              },
            }),
          ),
        ),
      );

      const response = await request2.fetch();

      expect(response.data?.[0]).not.toBeInstanceOf(Foo);
      expect(response.data?.[0]['title']).toBe('Test');
    });
  });

  it('should work with parsers', async () => {
    const request1 = new MockBaseRequest('foobar');

    const request2 = request1.pipe(
      setUrl('foobar'),
      parser((response) => ({ ...response, data: response.data?.['data'] })),
      fetchReference(
        jest.fn().mockResolvedValue(
          Promise.resolve({
            status: 200,
            json() {
              return Promise.resolve({
                data: {
                  title: 'Test',
                },
              });
            },
          }),
        ),
      ),
    );

    const response = await request2.fetch();

    expect(response.data).toBeInstanceOf(PureModel);
    expect(response.data?.['title']).toBe('Test');
  });

  it('should work with serializers', async () => {
    const request1 = new MockBaseRequest('foobar');

    const request2 = request1.pipe(
      setUrl('foobar'),
      method(HttpMethod.Post),
      body({ test: true }),
      serializer((data) => ({ data })),
      fetchReference(
        jest.fn().mockResolvedValue(
          Promise.resolve({
            status: 200,
            json() {
              return Promise.resolve({
                title: 'Test',
              });
            },
          }),
        ),
      ),
    );

    const response = await request2.fetch();

    expect(response.data).toBeInstanceOf(PureModel);
    expect(response.data?.['title']).toBe('Test');
    expect(request2['lastBody']).toBe(JSON.stringify({ data: { test: true } }));
  });
});
