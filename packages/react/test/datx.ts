import { Collection } from "@datx/core";
import { jsonapiCollection, config } from "@datx/jsonapi";

import { BASE_URL } from "./constants";
import { Todo } from "./models/Todo";

class Client extends jsonapiCollection(Collection) {
  public static types = [Todo];
}

export function createClient() {
  config.baseUrl = BASE_URL;
  config.cache = 1;

  return new Client();
}
