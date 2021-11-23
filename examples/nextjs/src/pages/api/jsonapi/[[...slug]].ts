import { createHandler } from '../../../api/handler';
import { Todo } from '../../../models/Todo';

export const config = {
  api: {
    externalResolver: true,
  },
}

export default createHandler({ types: [Todo] });
