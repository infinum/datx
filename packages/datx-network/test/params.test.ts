import { MockNetworkPipeline } from './mock/MockNetworkPipeline';
import { setUrl, params } from '../src';

describe('params', () => {
  it('should work for a basic params case', async () => {
    const request = new MockNetworkPipeline('foobar').pipe(
      setUrl('/test/{testId}/{mockId}'),
      params('testId', '123'),
      params('mockId', '456'),
    );

    await request.fetch();
    expect(request['lastUrl']).toBe('/test/123/456');
  });

  it('should work for object params', async () => {
    const request = new MockNetworkPipeline('foobar').pipe(
      setUrl('/test/{testId}/{mockId}'),
      params({
        testId: '234',
        mockId: '345',
      }),
    );

    await request.fetch();
    expect(request['lastUrl']).toBe('/test/234/345');
  });

  it('should work with missing params', async () => {
    const request = new MockNetworkPipeline('foobar').pipe(
      setUrl('/test/{testId}/{mockId}'),
      params('testId', '123'),
    );

    await request.fetch();
    expect(request['lastUrl']).toBe('/test/123/{mockId}');
  });

  it('should work with fetch addon', async () => {
    const request = new MockNetworkPipeline('foobar').pipe(
      setUrl('/test/{testId}/{mockId}'),
      params('testId', '123'),
    );

    await request.fetch({ mockId: '321' });
    expect(request['lastUrl']).toBe('/test/123/321');
  });

  it('should work with partial fetch addon', async () => {
    const request = new MockNetworkPipeline('foobar').pipe(setUrl('/test/{testId}/{mockId}'));

    await request.fetch({ mockId: '321' });
    expect(request['lastUrl']).toBe('/test/{testId}/321');
  });

  it('should work with full fetch params', async () => {
    const request = new MockNetworkPipeline('foobar').pipe(setUrl('/test/{testId}/{mockId}'));

    await request.fetch({ testId: '432', mockId: '321' });
    expect(request['lastUrl']).toBe('/test/432/321');
  });

  it('should work with multiple pipes', async () => {
    const request = new MockNetworkPipeline('foobar').pipe(
      setUrl('/test/{testId}/{mockId}'),
      params('testId', '123'),
    );

    const request2 = request.pipe(params('testId', '321'));

    await request2.fetch();
    await request.fetch();

    expect(request['lastUrl']).toBe('/test/123/{mockId}');
    expect(request2['lastUrl']).toBe('/test/321/{mockId}');
  });
});
