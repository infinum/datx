import { Hydrate } from '@datx/swr';
import type { NextPage, InferGetServerSidePropsType } from 'next';

import { queryPosts } from '../../../components/features/posts/Posts.queries';
import { Todos } from '../../../components/features/todos/Todos';
import { queryTodos } from '../../../components/features/todos/Todos.queries';
import { Layout } from '../../../components/shared/layouts/Layout/Layout';
import { createClient } from '../../../datx/createClient';

type SSRProps = InferGetServerSidePropsType<typeof getServerSideProps>;

const SSR: NextPage<SSRProps> = ({ fallback }) => {
  return (
    <Hydrate fallback={JSON.parse(fallback)}>
      <Layout>
        <Todos />
      </Layout>
    </Hydrate>
  );
};

export const getServerSideProps = async () => {
  const client = createClient();

  await Promise.all([client.fetchQuery(queryTodos), client.fetchQuery(queryPosts)]);

  // TODO - handle 404

  return {
    props: {
      fallback: JSON.stringify(client.fallback),
    },
  };
};

export default SSR;
