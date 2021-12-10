import { getModelEndpointUrl } from "@datx/jsonapi";
import { createQuery } from "../src";
import { Todo } from "./models/Todo";

export interface IQueryTodoVariables { shouldFetch?: boolean }

export const queryTodos = createQuery((client, variables: IQueryTodoVariables) => {
  const model = new Todo();
  const key = variables?.shouldFetch ? getModelEndpointUrl(model) : null;

  return {
    key,
    fetcher: (url: string) => client.request<Todo, Array<Todo>>(url, 'GET')
  };
});
