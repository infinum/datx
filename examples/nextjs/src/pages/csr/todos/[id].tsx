import type { NextPage } from 'next';
import { useRouter } from 'next/dist/client/router';

import { Todo } from '../../../components/features/todo/Todo';
import { Layout } from '../../../components/shared/layouts/Layout/Layout';

const CSRTodoPage: NextPage = () => {
  const { query } = useRouter();

  return (
    <Layout>
      <Todo id={query.id as string} />
    </Layout>
  );
};

export default CSRTodoPage;
