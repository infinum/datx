import type { NextPage } from 'next';

import { Todos } from '../../../components/features/todos/Todos';
import { Layout } from '../../../components/shared/layouts/Layout/Layout';

const CSR: NextPage = () => {
  return (
    <Layout>
      <Todos />
    </Layout>
  );
};

export default CSR;
