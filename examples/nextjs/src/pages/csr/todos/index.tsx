import type { NextPage } from 'next';
import { Posts } from '../../../components/features/posts/Posts';
import { Todos } from '../../../components/features/todos/Todos';
import { Layout } from '../../../components/shared/layouts/Layout/Layout';

const CSR: NextPage = () => {
  return (
    <Layout>
      <Todos />
      <Posts />
    </Layout>
  );
};

export default CSR;
