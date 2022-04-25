import { MockBaseRequest } from './mock/MockBaseRequest';
import { setUrl, params } from '../src';
import { clearAllCache } from '../src/interceptors/cache';

describe('params', () => {
  beforeEach(() => {
    clearAllCache();
  });

  it('should work for a basic params case', async () => {
    const request = new MockBaseRequest('foobar').pipe(
      setUrl('/test/{testId}/{mockId}'),
      params('testId', '123'),
      params('mockId', '456'),
    );

    await request.fetch();
    expect(request['lastUrl']).toBe('foobar/test/123/456');
  });

  it('should work for object params', async () => {
    const request = new MockBaseRequest('foobar').pipe(
      setUrl('/test/{testId}/{mockId}'),
      params({
        testId: '234',
        mockId: '345',
      }),
    );

    await request.fetch();
    expect(request['lastUrl']).toBe('foobar/test/234/345');
  });

  it('should work with missing params', async () => {
    const request = new MockBaseRequest('foobar').pipe(
      setUrl('/test/{testId}/{mockId}'),
      params('testId', '123'),
    );

    await request.fetch();
    expect(request['lastUrl']).toBe('foobar/test/123/{mockId}');
  });

  it('should work with fetch addon', async () => {
    const request = new MockBaseRequest('foobar').pipe(
      setUrl('/test/{testId}/{mockId}'),
      params('testId', '123'),
    );

    await request.fetch({ mockId: '321' });
    expect(request['lastUrl']).toBe('foobar/test/123/321');
  });

  it('should work with partial fetch addon', async () => {
    const request = new MockBaseRequest('foobar').pipe(setUrl('/test/{testId}/{mockId}'));

    await request.fetch({ mockId: '321' });
    expect(request['lastUrl']).toBe('foobar/test/{testId}/321');
  });

  it('should work with full fetch params', async () => {
    const request = new MockBaseRequest('foobar').pipe(setUrl('/test/{testId}/{mockId}'));

    await request.fetch({ testId: '432', mockId: '321' });
    expect(request['lastUrl']).toBe('foobar/test/432/321');
  });

  it('should work with multiple pipes', async () => {
    const request = new MockBaseRequest('foobar').pipe(
      setUrl('/test/{testId}/{mockId}'),
      params('testId', '123'),
    );

    const request2 = request.pipe(params('testId', '321'));

    await request2.fetch();
    expect(request2['lastUrl']).toBe('foobar/test/321/{mockId}');

    await request.fetch();
    expect(request['lastUrl']).toBe('foobar/test/123/{mockId}');
  });
});
