import { Predicate } from 'fp-ts/lib/function';

export const split = <T>(predicate: Predicate<T>) => (as: T[]) => {
  const result: T[][] = [];
  let current: T[] = [];
  as.forEach((e) => {
    if (!predicate(e)) {
      current.push(e);
    } else if (current.length > 0) {
      result.push(current);
      current = [];
    }
  });
  if (current.length > 0) {
    result.push(current);
  }
  return result;
};

export const spaces = ((n: number) => {
  const res: string[] = [];
  for (let index = 0; index < n; index++) {
    res.push(index === 0 ? '' : res[index - 1] + ' ');
  }
  return res;
})(20);

export const deepFlatten = (a: any[]) => {
  let res: any[] = [];
  a.forEach((item) => {
    if (item.length === undefined) {
      res.push(item);
    } else {
      res = res.concat(deepFlatten(item));
    }
  });
  return res;
};
