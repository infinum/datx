import {IDictionary} from 'datx-utils';

const REGEX = /\$\{\s*([a-zA-Z0-9\-\_]+)\s*\}/g;

function msg(str: string, keys: IDictionary<any>) {
  let match = REGEX.exec(str);
  while (match) {
    str = str.replace(match[0], keys[match[1]]);
    match = REGEX.exec(str);
  }
  return str;
}

export function error(str: string, keys: IDictionary<any> = {}): Error {
  return new Error(`[datx exception] ${msg(str, keys)}`);
}
