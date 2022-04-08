import { IGetManyExpression } from '../src';
import { Todo } from './models/Todo';

export const queryTodos: IGetManyExpression = {
  op: 'getMany',
  type: Todo.type,
};
