import { IGetOneExpression } from '@datx/swr';
import { Todo } from '../../../models/Todo';

export const getTodoQuery = (id?: string) =>
  id
    ? ({
        id,
        op: 'getOne',
        type: 'todos',
      } as IGetOneExpression<typeof Todo>)
    : null;
