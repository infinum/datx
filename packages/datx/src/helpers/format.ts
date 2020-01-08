const REGEX = /\$\{\s*([a-zA-Z0-9\-\_]+)\s*\}/g;

function msg(str: string, keys: Record<string, any>) {
  let msgStr = str;
  let match = REGEX.exec(msgStr);
  while (match) {
    msgStr = msgStr.replace(match[0], keys[match[1]]);
    match = REGEX.exec(msgStr);
  }

  return msgStr;
}

// tslint:disable-next-line:export-name
export function error(message: string, keys: Record<string, any> = {}): Error {
  return new Error(`[datx exception] ${msg(message, keys)}`.replace(/\s+/g, ' '));
}
