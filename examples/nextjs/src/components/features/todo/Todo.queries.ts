import { GetOneExpression } from '@datx/swr';

import { Todo } from '../../../models/Todo';

type Query = (id: string) => GetOneExpression<Todo>;

export const queryTodo: Query = (id: string) => ({
  id,
  op: 'getOne',
  type: Todo,
});
