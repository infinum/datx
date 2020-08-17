import { MockBaseRequest } from './mock/MockBaseRequest';
import { body, setUrl, method, HttpMethod, header } from '../src';
import { BodyType } from '../src/enums/BodyType';

describe('body', () => {
  it('should not send anything for get', async () => {
    const request = new MockBaseRequest('foobar').pipe(setUrl('foobar'), body('sdasdsad'));

    await request.fetch();

    expect(request['lastBody']).toBeUndefined();
  });

  it('should send something if the method is supported', async () => {
    const request = new MockBaseRequest('foobar').pipe(
      setUrl('foobar'),
      body('sdasdsad'),
      method(HttpMethod.Post),
    );

    await request.fetch();

    expect(request['lastBody']).toBe('sdasdsad');
    expect(request['lastMethod']).toBe('POST');
  });

  it('should send the no content type if body type is raw', async () => {
    const request = new MockBaseRequest('foobar').pipe(
      setUrl('foobar'),
      body('sdasdsad', BodyType.Raw),
      method(HttpMethod.Post),
    );

    await request.fetch();

    expect(request['lastBody']).toBe('sdasdsad');
    expect(request['lastMethod']).toBe('POST');
    expect(request['lastHeaders']).toEqual({});
  });

  it('should send the correct urlencoded data', async () => {
    const request = new MockBaseRequest('foobar').pipe(
      setUrl('foobar'),
      body({ foo: 1, bar: 2 }, BodyType.Urlencoded),
      method(HttpMethod.Post),
    );

    await request.fetch();

    expect(request['lastBody']).toBe('foo=1&bar=2');
    expect(request['lastMethod']).toBe('POST');
    expect(request['lastHeaders']).toEqual({ 'content-type': 'application/x-www-form-urlencoded' });
  });

  it('should send the correct json data', async () => {
    const request = new MockBaseRequest('foobar').pipe(
      setUrl('foobar'),
      body({ foo: 1, bar: 2 }),
      method(HttpMethod.Post),
    );

    await request.fetch();

    expect(request['lastBody']).toBe('{"foo":1,"bar":2}');
    expect(request['lastMethod']).toBe('POST');
    expect(request['lastHeaders']).toEqual({ 'content-type': 'application/json' });
  });

  it('should use the custom content-type header if set', async () => {
    const request = new MockBaseRequest('foobar').pipe(
      setUrl('foobar'),
      header('content-type', 'foobar'),
      body({ foo: 1, bar: 2 }),
      method(HttpMethod.Post),
    );

    await request.fetch();

    expect(request['lastBody']).toBe('{"foo":1,"bar":2}');
    expect(request['lastMethod']).toBe('POST');
    expect(request['lastHeaders']).toEqual({ 'content-type': 'foobar' });
  });

  it('should send the correct FormData', async () => {
    const data = new FormData();
    data.append('foo', '1');

    const request = new MockBaseRequest('foobar').pipe(
      setUrl('foobar'),
      body(data),
      method(HttpMethod.Post),
    );

    await request.fetch();

    expect(request['lastBody']).toBe(data);
    expect(request['lastMethod']).toBe('POST');
    expect(request['lastHeaders']).toEqual({ 'content-type': 'multipart/form-data' });
  });
});
