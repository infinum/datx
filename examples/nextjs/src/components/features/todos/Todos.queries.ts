import { getModelEndpointUrl, IJsonapiCollection } from "@datx/jsonapi";
import { Client } from "@datx/react";

import { Todo } from "../../../models/Todo";

export const queryTodos = (client: Client) => {
  const model = new Todo();
  const key = getModelEndpointUrl(model);

  return {
    key,
    fetcher: (url: string) => client.request<Todo, Array<Todo>>(url, 'GET')
  };
};
