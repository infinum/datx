import { GetOneExpression } from '@datx/swr';

import { Todo } from '../../../models/Todo';

type Query = (id: string) => GetOneExpression<Todo>;

// Accept generic in queries for determining return value (model type)

export const queryTodo: Query = (id: string) => ({
  id,
  op: 'getOne',
  type: Todo.type,
});
