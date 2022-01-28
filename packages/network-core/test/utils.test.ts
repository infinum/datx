import { ParamArrayType, parametrize, appendQueryParams, interpolateParams } from '../src';

describe('utils', () => {
  describe('parametrize', () => {
    it('should work for empty params', () => {
      expect(parametrize({}, ParamArrayType.ParamArray)).toEqual([]);
    });

    it('should work for ParamArray', () => {
      expect(parametrize({ foo: [1, 2, 3] }, ParamArrayType.ParamArray)).toEqual([
        {
          key: 'foo[]',
          value: '1',
        },
        {
          key: 'foo[]',
          value: '2',
        },
        {
          key: 'foo[]',
          value: '3',
        },
      ]);
    });

    it('should work for CommaSeparated', () => {
      expect(parametrize({ foo: [1, 2, 3] }, ParamArrayType.CommaSeparated)).toEqual([
        {
          key: 'foo',
          value: '1,2,3',
        },
      ]);
    });

    it('should work for MultipleParams', () => {
      expect(parametrize({ foo: [1, 2, 3] }, ParamArrayType.MultipleParams)).toEqual([
        {
          key: 'foo',
          value: '1',
        },
        {
          key: 'foo',
          value: '2',
        },
        {
          key: 'foo',
          value: '3',
        },
      ]);
    });

    it('should work for MultipleParams and nested data', () => {
      expect(
        parametrize({ foo: { bar: [1, 2, 3] }, baz: { test: 1 } }, ParamArrayType.MultipleParams),
      ).toEqual([
        {
          key: 'foo[bar]',
          value: '1',
        },
        {
          key: 'foo[bar]',
          value: '2',
        },
        {
          key: 'foo[bar]',
          value: '3',
        },
        {
          key: 'baz[test]',
          value: '1',
        },
      ]);
    });
  });

  describe('appendQueryParams', () => {
    it('should work for urls without params', () => {
      expect(
        appendQueryParams('http://example.com', { foo: 1 }, ParamArrayType.ParamArray, false),
      ).toEqual('http://example.com?foo=1');
    });

    it('should work for urls with params', () => {
      expect(
        appendQueryParams('http://example.com?test', { foo: 1 }, ParamArrayType.ParamArray, false),
      ).toEqual('http://example.com?test&foo=1');
    });

    it('should work for params with unsafe characters (no escaping)', () => {
      expect(
        appendQueryParams(
          'http://example.com',
          { foo: '&?', '#': '21' },
          ParamArrayType.ParamArray,
          false,
        ),
      ).toEqual('http://example.com?foo=&?&#=21');
    });

    it('should work for params with unsafe characters (escaping)', () => {
      expect(
        appendQueryParams(
          'http://example.com',
          { foo: '&?', '==': '=21' },
          ParamArrayType.ParamArray,
          true,
        ),
      ).toEqual('http://example.com?foo=%26%3F&===%3D21');
    });
  });

  describe('interpolateParams', () => {
    it('should work for basic case', () => {
      expect(
        interpolateParams(
          'http://example.com/{foo}/{   foo}/{fooo }/{fo}/{baz}/{baR}/{bar}/{ba r}/{bar/}{ba.r}',
          {
            bar: 'baz',
            foo: 'bar',
          },
        ),
      ).toEqual('http://example.com/bar/bar/{fooo }/{fo}/{baz}/{baR}/baz/{ba r}/{bar/}{ba.r}');
    });
  });
});
