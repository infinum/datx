import { IGetManyExpression } from '@datx/swr';

import { Todo } from '../../../models/Todo';

export const todosQuery: IGetManyExpression<typeof Todo> = {
  op: 'getMany',
  type: 'todos',
};
