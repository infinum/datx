import { Expression } from '@datx/swr';
import { Todo } from '../../../models/Todo';

export const todoQuery = (id?: string): Expression => id ? ({
  id,
  op: 'getOne' as const,
  type: Todo.type,
}) : null;
