import { MockBaseRequest } from './mock/MockBaseRequest';
import { addInterceptor, setUrl, fetchReference } from '../src';

describe('Request', () => {
  it('should initialize', () => {
    const request = new MockBaseRequest('foobar');
    expect(request).toBeTruthy();
    expect(request.config.baseUrl).toBe('foobar');
    expect(request.config.maxCacheAge).toBe(Infinity);
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
    expect(request1.config).not.toBe(request2.config);

    expect(request1).not.toBe(request3);
    expect(request1.config).not.toBe(request3.config);

    expect(request3).not.toBe(request2);
    expect(request3.config).not.toBe(request2.config);

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

    expect(request1.options.url).toBe(undefined);
    expect(request2.options.url).toBe('bar');
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

    expect(request2.config.fetchReference).toHaveBeenCalledTimes(1);
    expect(request1.config.fetchReference).toHaveBeenCalledTimes(1);
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

    expect(request2.config.fetchReference).toHaveBeenCalledTimes(1);
    expect(request1.config.fetchReference).toHaveBeenCalledTimes(0);
  });
});
