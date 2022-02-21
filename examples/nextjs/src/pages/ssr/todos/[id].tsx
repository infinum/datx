import { fetchQuery, Hydrate } from '@datx/swr';
import type { GetServerSidePropsContext, InferGetServerSidePropsType, NextPage } from 'next';

import { Todo } from '../../../components/features/todo/Todo';
import { queryTodo } from '../../../components/features/todo/Todo.queries';
import { Layout } from '../../../components/shared/layouts/Layout/Layout';
import { createClient } from '../../../datx/createClient';

type SSRTodoPageProps = InferGetServerSidePropsType<typeof getServerSideProps>;

const SSRTodoPage: NextPage<SSRTodoPageProps> = ({ id, fallback }) => {
  return (
    <Hydrate fallback={fallback}>
      <Layout>
        <Todo id={id} />
      </Layout>
    </Hydrate>
  );
};

export const getServerSideProps = async ({ params }: GetServerSidePropsContext<{ id: string }>) => {
  const { id } = params || {};

  if (!id) {
    return {
      notFound: true,
    }
  }

  const client = createClient();

  // const todo = await fetchQuery(client, queryTodo, { id });

  // const response = await client.fetchQuery(() => queryTodo(id));
  // await client.fetchQuery(() => queryProfile(response.data.id));

  // Parallel example
  // Promise.all([
  //   client.fetchQuery(() => queryTodo(id)),
  //   client.fetchQuery(() => queryTodo(id)),
  //   client.fetchQuery(() => queryTodo(id))
  // ]);

  // const { fallback } = client;

  return {
    props: {
      id,
      // fallback
    },
  };
};

export default SSRTodoPage;
