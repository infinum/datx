import { query, setUrl, paramArrayType, ParamArrayType, encodeQueryString } from '../src';
import { MockBaseRequest } from './mock/MockBaseRequest';
import { clearAllCache } from '../src/interceptors/cache';

describe('query params', () => {
  beforeEach(() => {
    clearAllCache();
  });

  it('should work for a basic params case', async () => {
    const request = new MockBaseRequest('foobar').pipe(setUrl('/test'), query('test', '123'));

    await request.fetch();
    expect(request['lastUrl']).toBe('foobar/test?test=123');
  });

  it('should skip the undefined params', async () => {
    const request = new MockBaseRequest('foobar').pipe(setUrl('/test'), query('test', undefined));

    await request.fetch();
    expect(request['lastUrl']).toBe('foobar/test');
  });

  it('should work for a basic params case and existing queryparams', async () => {
    const request = new MockBaseRequest('foobar').pipe(setUrl('/test?foo=1'), query('test', '123'));

    await request.fetch();
    expect(request['lastUrl']).toBe('foobar/test?foo=1&test=123');
  });

  it('should work for a basic params case and empty query params', async () => {
    const request = new MockBaseRequest('foobar').pipe(setUrl('/test?'), query('test', '123'));

    await request.fetch();
    expect(request['lastUrl']).toBe('foobar/test?test=123');
  });

  it('should work for a basic params case and next query params', async () => {
    const request = new MockBaseRequest('foobar').pipe(
      setUrl('/test?foo=1&'),
      query('test', '123'),
    );

    await request.fetch();
    expect(request['lastUrl']).toBe('foobar/test?foo=1&test=123');
  });

  it('should work for a multiple params case', async () => {
    const request = new MockBaseRequest('foobar').pipe(
      setUrl('/test'),
      query('test', '123'),
      query('foo', '1'),
    );

    await request.fetch();
    expect(request['lastUrl']).toBe('foobar/test?test=123&foo=1');
  });

  it('should work for complex query and ParamArray', async () => {
    const request = new MockBaseRequest('foobar').pipe(
      setUrl('/test'),
      query('test', ['123', '234']),
      query('foo', {
        bar: '1',
        baz: ['2', '3'],
        test: {
          foo: {
            bar: ['4', '5'],
          },
        },
      }),
    );

    await request.fetch();
    expect(request['lastUrl']).toBe(
      // eslint-disable-next-line max-len
      'foobar/test?test[]=123&test[]=234&foo[bar]=1&foo[baz][]=2&foo[baz][]=3&foo[test][foo][bar][]=4&foo[test][foo][bar][]=5',
    );
  });

  it('should work for complex query and ParamArray', async () => {
    const request = new MockBaseRequest('foobar').pipe(
      setUrl('/test'),
      query('test', ['123', '234']),
      query('foo', {
        bar: '1',
        baz: ['2', '3'],
        test: {
          foo: {
            bar: ['4', '5'],
          },
        },
      }),
      paramArrayType(ParamArrayType.MultipleParams),
    );

    await request.fetch();
    expect(request['lastUrl']).toBe(
      'foobar/test?test=123&test=234&foo[bar]=1&foo[baz]=2&foo[baz]=3&foo[test][foo][bar]=4&foo[test][foo][bar]=5',
    );
  });

  it('should work for complex query and ParamArray', async () => {
    const request = new MockBaseRequest('foobar').pipe(
      setUrl('/test'),
      query('test', ['123', '234']),
      query('foo', {
        bar: '1',
        baz: ['2', '3'],
        test: {
          foo: {
            bar: ['4', '5'],
          },
        },
      }),
      paramArrayType(ParamArrayType.CommaSeparated),
    );

    const request2 = request.pipe(encodeQueryString(false));

    await request.fetch();
    expect(request['lastUrl']).toBe(
      'foobar/test?test=123%2C234&foo[bar]=1&foo[baz]=2%2C3&foo[test][foo][bar]=4%2C5',
    );

    await request2.fetch();
    expect(request2['lastUrl']).toBe(
      'foobar/test?test=123,234&foo[bar]=1&foo[baz]=2,3&foo[test][foo][bar]=4,5',
    );
  });

  it('should work for complex query in fetch and ParamArray', async () => {
    const request = new MockBaseRequest('foobar').pipe(
      setUrl('/test'),
      query('test', ['123', '234']),
      paramArrayType(ParamArrayType.CommaSeparated),
    );

    const request2 = request.pipe(encodeQueryString(false));

    await request.fetch(null, {
      foo: {
        bar: '1',
        baz: ['2', '3'],
        test: {
          foo: {
            bar: ['4', '5'],
          },
        },
      },
    });
    expect(request['lastUrl']).toBe(
      'foobar/test?test=123%2C234&foo[bar]=1&foo[baz]=2%2C3&foo[test][foo][bar]=4%2C5',
    );

    await request2.fetch(null, {
      foo: {
        bar: '1',
        baz: ['2', '3'],
        test: {
          foo: {
            bar: ['4', '5'],
          },
        },
      },
    });
    expect(request2['lastUrl']).toBe(
      'foobar/test?test=123,234&foo[bar]=1&foo[baz]=2,3&foo[test][foo][bar]=4,5',
    );
  });
});
