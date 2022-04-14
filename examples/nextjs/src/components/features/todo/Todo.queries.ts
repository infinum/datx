import { Todo } from '../../../models/Todo';

export const getTodoQuery = (id?: string) =>
  id
    ? ({
        id,
        op: 'getOne',
        type: Todo.type,
      } as const)
    : null;
