import { GetOneExpression } from '@datx/swr';

import { Todo } from '../../../models/Todo';

export const queryTodo = (id: string): GetOneExpression<Todo> => ({
  id,
  op: 'getOne',
  type: Todo.type,
});
