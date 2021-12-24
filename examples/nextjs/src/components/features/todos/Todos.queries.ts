import { GetManyQueryExpression } from '@datx/swr';

import { Todo } from '../../../models/Todo';

export const queryTodos: GetManyQueryExpression<Todo> = {
  op: 'getMany',
  type: Todo,
  options: { queryParams: { include: 'test' } },
};
