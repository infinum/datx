import { IGetOneExpression } from '@datx/swr';

import { Todo } from '../../../models/Todo';

export const queryTodo = (id: string): IGetOneExpression => ({
  id,
  op: 'getOne',
  type: Todo.type,
});
