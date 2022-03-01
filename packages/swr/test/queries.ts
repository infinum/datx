import { GetManyExpression } from '../src';
import { Todo } from './models/Todo';

export const queryTodos: GetManyExpression<Todo> = {
  op: 'getMany',
  type: Todo.type,
};
