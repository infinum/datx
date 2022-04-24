import { Response } from '@datx/jsonapi';

import { Todo } from '../../../models/Todo';

export type TodosResponse = Response<Todo, Array<Todo>>;

export const todosQuery = {
  op: 'getMany',
  type: 'todos',
} as const;
