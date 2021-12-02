import { getModelEndpointUrl } from "@datx/jsonapi";
import { createQuery } from "@datx/react";

import { Todo } from "../../../models/Todo";

export const queryTodo = createQuery((client) => {
  const model = new Todo();
  const key = getModelEndpointUrl(model);

  return {
    key,
    fetcher: (url: string) => client.request<Todo, Array<Todo>>(url, 'GET')
  };
});
