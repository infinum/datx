import { getModelEndpointUrl, modelToJsonApi } from "@datx/jsonapi";
import { createMutation } from "@datx/react";

import { Todo } from "../../../models/Todo";

export const createTodo = createMutation((client, message: string | undefined) => {
  const model = new Todo({ message });
  const url = getModelEndpointUrl(model);
  const data = modelToJsonApi(model);

  return client.request<Todo>(url, 'POST', { data });
});
