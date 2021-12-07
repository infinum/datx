import { Collection } from "@datx/core";
import { jsonapiCollection, config } from "@datx/jsonapi";

import { Todo } from "../models/Todo";

class Client extends jsonapiCollection(Collection) {
  public static types = [Todo];
}

export function createClient() {
  config.baseUrl = process.env.NEXT_PUBLIC_JSONAPI_URL as string;
  config.cache = 1;
  // config.fetchReference = (isBrowser &&
  //   'fetch' in window &&
  //   typeof window.fetch === 'function' &&
  //   window.fetch.bind(window)) ||
  // undefined;

  return new Client();
}
