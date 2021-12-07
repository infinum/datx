import { Collection } from "@datx/core";
import { jsonapiCollection, config } from "@datx/jsonapi";

import { Todo } from "./models/Todo";

class Client extends jsonapiCollection(Collection) {
  public static types = [Todo];
}

export function createClient() {
  config.baseUrl = 'https://example.com/';
  config.cache = 1;

  return new Client();
}
