
export function unique(arr: Array<any>): Array<any> {
  return arr.filter((v, i, a) => a.indexOf(v) === i);
}

export function mergeAsArray(obj: object, key: string, value: any | Array<any>): object {
  const target = Object.assign({ }, obj);
  if (!target[key]) {
    target[key] = [].concat(value);

    return target;
  }
  target[key] = unique([].concat(target[key], value));

  return target;
}

export function reverseObjectKV(obj: object) {
  return Object.keys(obj).reduce((map, key) => {
    let __keys = obj[key];

    if (!Array.isArray(obj[key])) {
      __keys = [obj[key]];
    }

    __keys.forEach((_key) => {
      map[_key] = (map[_key] && map[_key].concat(key)) || [key];
    });

    return map;
  }, { });
}

export function peekValue(data: object, keys: Array<string>): any {
  if (data === undefined || keys === undefined) { return undefined; }
  let oo;
  let i = -1;
  while (++i < keys.length) {
    const _v = data[keys[i]];
    if (_v !== undefined && _v !== null) {
        oo = _v;
        break;
      }
  }

  return oo;
}
