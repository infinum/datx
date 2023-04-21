import { isGenerator } from '../src/utils';

describe('utils', () => {
  describe('isGenerator', () => {
    it('should return false if field is undefined', () => {
      expect(isGenerator(undefined)).toBe(false);
    });
  });
});
