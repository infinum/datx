import { Response } from '@datx/jsonapi';
import { GetManyExpression } from '@datx/swr';

import { Todo } from '../../../models/Todo';

export type TodosResponse = Response<Todo, Array<Todo>>;

export const queryTodos: GetManyExpression<Todo> = {
  op: 'getMany',
  type: Todo.type,
};
