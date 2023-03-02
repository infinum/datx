import { Collection } from '@datx/core';
import { jsonapi } from '@datx/jsonapi';

import { User } from './models/User';

export class JsonapiTestClient extends jsonapi(Collection) {
  public static types = [User];
}

export const createJsonapiClient = () => {
  const client = new JsonapiTestClient();

  return client;
};
