import { getModelEndpointUrl } from "@datx/jsonapi";
import { Client } from "../src/interfaces/Client";
import { Todo } from "./models/Todo";

export interface IQueryTodoVariables { shouldFetch?: boolean }

export const queryTodos = (client: Client, variables: IQueryTodoVariables) => {
  const model = new Todo();
  const key = variables?.shouldFetch ? getModelEndpointUrl(model) : null;

  return {
    key,
    fetcher: (url: string) => client.request<Todo, Array<Todo>>(url, 'GET')
  };
};
