import {flatten, isFalsyArray, mapItems, uniq} from '../src';

describe('datx-utils', () => {
  describe('mapUtils', () => {
    it('should work for null', () => {
      expect(mapItems(null, () => 1)).toBe(null);
    });

    it('should work for a single item', () => {
      expect(mapItems(1, (i) => i * 2)).toBe(2);
    });

    it('should work for an array', () => {
      expect(mapItems([1, 2], (i) => i * 2)).toEqual([2, 4]);
    });
  });

  describe('flatten', () => {
    it('should work with a simple array', () => {
      expect(flatten([[1], [2], [3]])).toEqual([1, 2, 3]);
    });

    it('should work with a complex array', () => {
      expect(flatten([[1], [2, 3], [4, 5], [6]])).toEqual([1, 2, 3, 4, 5, 6]);
    });
  });

  describe('uniq', () => {
    it('should work if no duplicates', () => {
      expect(uniq([1, 2, 3])).toEqual([1, 2, 3]);
    });

    it('should remove duplicate values', () => {
      expect(uniq([1, 2, 3, 1])).toEqual([1, 2, 3]);
    });

    it('should remove multiple duplicate values', () => {
      expect(uniq([1, 2, 3, 1, 1, 2, 1, 1, 2, 3, 3, 2, 1])).toEqual([1, 2, 3]);
    });
  });

  describe('isFalsyArray', () => {
    it('should work for falsy arrays', () => {
      expect(isFalsyArray([0, null, undefined, ''])).toBe(true);
    });

    it('should work for truthy arrays', () => {
      expect(isFalsyArray([1, 2, 3, {}, [], '123'])).toBe(false);
    });

    it('should work for mixed arrays', () => {
      expect(isFalsyArray([0, null, 1, ''])).toBe(true);
    });
  });
});
