import { MockNetworkPipeline } from './mock/MockNetworkPipeline';
import { addInterceptor, setUrl } from '../src';

describe('Request', () => {
  it('should initialize', () => {
    const request = new MockNetworkPipeline('foobar');
    expect(request).toBeTruthy();
    expect(request.config.baseUrl).toBe('foobar');
    expect(request.config.maxCacheAge).toBe(Infinity);
    expect(request).toBeInstanceOf(MockNetworkPipeline);
  });

  it('should clone the request', () => {
    class FooRequest extends MockNetworkPipeline {}
    const request1 = new MockNetworkPipeline('foobar');
    const request2 = request1.clone(FooRequest as any);
    const request3 = request1.pipe();

    expect(request1).not.toBe(request2);
    expect(request1.config).not.toBe(request2.config);

    expect(request1).not.toBe(request3);
    expect(request1.config).not.toBe(request3.config);

    expect(request3).not.toBe(request2);
    expect(request3.config).not.toBe(request2.config);

    expect(request1).toBeInstanceOf(MockNetworkPipeline);
    expect(request1).not.toBeInstanceOf(FooRequest);

    expect(request2).toBeInstanceOf(MockNetworkPipeline);
    expect(request2).toBeInstanceOf(FooRequest);

    expect(request3).toBeInstanceOf(MockNetworkPipeline);
    expect(request3).not.toBeInstanceOf(FooRequest);
  });

  it('should run the pipes in the right order', () => {
    const request1 = new MockNetworkPipeline('foobar');

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

    const request1 = new MockNetworkPipeline('foobar');

    const request2 = request1.pipe(
      setUrl('foobar'),
      addInterceptor(mockInterceptor(0)),
      addInterceptor(mockInterceptor(1)),
      addInterceptor(mockInterceptor(2)),
    );

    await request2.fetch();

    expect(request2['baseFetch']).toHaveBeenCalledTimes(1);
    expect(request1['baseFetch']).toHaveBeenCalledTimes(0);
  });
});
