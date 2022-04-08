import type { NextPage } from 'next';
import { useRouter } from 'next/dist/client/router';
import { useSimulateDependantCall } from 'src/hooks/use-simulate-dependant-call';

import { Todo } from '../../../components/features/todo/Todo';
import { Layout } from '../../../components/shared/layouts/Layout/Layout';

const CSRTodoPage: NextPage = () => {
  const { query } = useRouter();
  const id = useSimulateDependantCall(String(query.id));

  return (
    <Layout>
      <Todo id={id} />
    </Layout>
  );
};

export default CSRTodoPage;
