import { Hydrate } from '@datx/swr';
import type { NextPage, InferGetServerSidePropsType, GetServerSideProps } from 'next';

import { Todos } from '../../../components/features/todos/Todos';
import { todosQuery } from '../../../components/features/todos/Todos.queries';
import { Layout } from '../../../components/shared/layouts/Layout/Layout';
import { withDatx } from '../../../datx/createClient';

type SSRProps = InferGetServerSidePropsType<typeof getServerSideProps>;

const SSR: NextPage<SSRProps> = ({ fallback }) => {
  return (
    <Hydrate fallback={fallback}>
      <Layout>
        <Todos />
      </Layout>
    </Hydrate>
  );
};

export const getServerSideProps = withDatx(async ({ client }) => {
  await client.fetchQuery(todosQuery);

  // TODO - handle 404

  return {};
});

export default SSR;
