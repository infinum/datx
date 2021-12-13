import { fetchQuery, Hydrate } from '@datx/react';
import type { NextPage, InferGetServerSidePropsType } from 'next';

import { Todos } from '../../../components/features/todos/Todos';
import { queryTodos } from '../../../components/features/todos/Todos.queries';
import { Layout } from '../../../components/shared/layouts/Layout/Layout';
import { createClient } from '../../../datx/createClient';

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

export const getServerSideProps = async () => {
  const client = createClient();

  const todo = await fetchQuery(client, queryTodos);

  // TODO - handle 404

  return {
    props: {
      fallback: {
        ...todo,
      },
    },
  };
};

export default SSR;
