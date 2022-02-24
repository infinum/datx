import type { NextPage } from 'next';
import { useRouter } from 'next/dist/client/router';
import { useDependantCall } from 'src/hooks/useDependantCall';

import { Todo } from '../../../components/features/todo/Todo';
import { Layout } from '../../../components/shared/layouts/Layout/Layout';

const CSRTodoPage: NextPage = () => {
  const { query } = useRouter();
  const shouldFetch = useDependantCall();

  return (
    <Layout>
      <Todo id={query.id as string} shouldFetch={shouldFetch} />
    </Layout>
  );
};

export default CSRTodoPage;
