import { Collection } from "@datx/core";
import { jsonapiCollection, config } from "@datx/jsonapi";

import { Post } from "../models/Post";
import { Todo } from "../models/Todo";

class Client extends jsonapiCollection(Collection) {
  public static types = [Todo, Post];
}

export function createClient() {
  config.baseUrl = process.env.NEXT_PUBLIC_JSONAPI_URL as string;
  config.cache = 1;

  return new Client();
}
