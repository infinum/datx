import { Response } from '@datx/jsonapi';
import { IGetManyExpression } from '@datx/swr';

import { Todo } from '../../../models/Todo';

export type TodosResponse = Response<Todo, Array<Todo>>;

export const queryTodos: IGetManyExpression = {
  op: 'getMany',
  type: Todo.type,
};
