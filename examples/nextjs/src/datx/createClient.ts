import { Collection } from "@datx/core";
import { jsonapiCollection, config, CachingStrategy } from "@datx/jsonapi";

import { Todo } from "../models/Todo";

class Client extends jsonapiCollection(Collection) {
  public static types = [Todo];
};

export function createClient() {
  config.baseUrl = process.env.NEXT_PUBLIC_JSONAPI_URL as string;
  config.cache = 1;

  return new Client();
}
