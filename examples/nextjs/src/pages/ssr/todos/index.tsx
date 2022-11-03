import { Hydrate } from '@datx/swr';
import type { NextPage, InferGetServerSidePropsType } from 'next';

import { postsQuery } from '../../../components/features/posts/Posts.queries';
import { Todos } from '../../../components/features/todos/Todos';
import { todosQuery } from '../../../components/features/todos/Todos.queries';
import { Layout } from '../../../components/shared/layouts/Layout/Layout';
import { gSSP } from '../../../datx/createClient';

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

export const getServerSideProps = gSSP(async ({ client }) => {
  await Promise.allSettled([client.fetchQuery(todosQuery), client.fetchQuery(postsQuery)]);

  // TODO - handle 404

  return {};
});

export default SSR;
