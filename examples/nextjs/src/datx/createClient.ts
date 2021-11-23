import { Collection } from "@datx/core";
import { jsonapiCollection, config } from "@datx/jsonapi";

import { Todo } from "../models/Todo";

class Store extends jsonapiCollection(Collection) {
  public static types = [Todo];
};

export function createClient() {
  console.log(process.env.NEXT_PUBLIC_JSONAPI_URL)
  config.baseUrl = process.env.NEXT_PUBLIC_JSONAPI_URL as string;

  return new Store();
}
