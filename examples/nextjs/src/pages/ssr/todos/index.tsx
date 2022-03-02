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
    <Hydrate fallback={fallback}>
      <Layout>
        <Todos />
      </Layout>
    </Hydrate>
  );
};

export const getServerSideProps = async () => {
  const client = createClient();

  await Promise.allSettled([client.fetchQuery(queryTodos), client.fetchQuery(queryPosts)]);

  // TODO - handle 404

  const { fallback } = client;

  return {
    props: {
      fallback,
    },
  };
};

export default SSR;
