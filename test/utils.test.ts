import { split } from '../src/utils';
import { spaces } from './../src/utils';

describe('split', () => {
  test('', () => {
    expect(split((e) => e === 0)([1, 0, 0, 1, 1])).toEqual([[1], [1, 1]]);
    expect(split((e) => e === 0)([1, 0, 0])).toEqual([[1]]);
    expect(split((e) => e === 0)([0, 0, 1])).toEqual([[1]]);
    expect(split((e) => e === 0)([0, 1, 0, 0, 1, 1])).toEqual([[1], [1, 1]]);
    expect(split((e) => e === 0)([1, 0, 0, 1, 1, 0])).toEqual([[1], [1, 1]]);
    expect(split((e) => e === 0)([0, 0, 0])).toEqual([]);
  });
});

describe('spaces', () => {
  test('', () => {
    spaces.forEach((str, idx) => {
      expect(str.length).toEqual(idx);
      expect(str).toMatch(/^\s*$/);
    });
  });
});
