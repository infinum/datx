import { Response } from '@datx/jsonapi';
import { Expression } from '@datx/swr';

import { Todo } from '../../../models/Todo';

export type TodosResponse = Response<Todo, Array<Todo>>;

export const todosQuery: Expression = {
  op: 'getMany',
  type: Todo.type,
};
