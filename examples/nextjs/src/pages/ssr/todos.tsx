import { fetchQuery, Hydrate } from '@datx/react';
import type { NextPage, InferGetServerSidePropsType } from 'next';

import { Todos } from '../../components/features/todos/Todos';
import { queryTodo } from '../../components/features/todos/Todos.queries';
import { createClient } from '../../datx/createClient';

type SSRProps = InferGetServerSidePropsType<typeof getServerSideProps>;

const SSR: NextPage<SSRProps> = ({ fallback }) => {
  return (
    <Hydrate fallback={fallback}>
      <Todos />
    </Hydrate>
  );
};

export const getServerSideProps = async () => {
  const client = createClient();

  const todo = await fetchQuery(client, queryTodo);

  return {
    props: {
      fallback: {
        ...todo,
      },
    },
  };
};

export default SSR;
