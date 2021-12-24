import { getModelEndpointUrl, modelToJsonApi } from "@datx/jsonapi";
import { Client } from "@datx/swr";

import { Todo } from "../../../models/Todo";

export const createTodo = (client: Client, message: string | undefined) => {
  const model = new Todo({ message });
  const url = getModelEndpointUrl(model);
  const data = modelToJsonApi(model);

  return client.request<Todo, Array<Todo>>(url, 'POST', { data });
};
