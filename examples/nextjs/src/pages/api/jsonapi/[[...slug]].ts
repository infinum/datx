import '@datx/core/disable-mobx';

import { createHandler } from '../../../server/handler';
import { Post } from '../../../models/Post';
import { Todo } from '../../../models/Todo';

export const config = {
  api: {
    externalResolver: false,
  },
};

export default createHandler({ types: [Todo, Post] });
