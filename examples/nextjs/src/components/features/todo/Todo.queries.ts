import { getModelType } from "@datx/core";
import { prepareQuery } from "@datx/jsonapi";
import { Client } from "@datx/swr";

import { Todo } from "../../../models/Todo";

export interface IQueryTodoVariables {
  id?: string;
}

export const queryTodo = (client: Client, variables?: IQueryTodoVariables) => {
  const modelType = getModelType(Todo);
  const key = variables?.id ? prepareQuery(modelType, variables?.id) : null;

  return {
    key: key?.url,
    fetcher: (url: string) => client.request<Todo, Todo>(url, 'GET')
  };
};
