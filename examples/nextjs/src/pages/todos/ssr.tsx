import { fetchQuery } from '@datx/react';
import type { NextPage, GetServerSideProps } from 'next';

import { Todos } from '../../components/features/todos/Todos';
import { queryTodo } from '../../components/features/todos/Todos.queries';
import { createClient } from '../../datx/createClient';

const SSR: NextPage = ({ fallback }) => {
  return (
    <Hydrate fallback={fallback}>
      <Todos />
    </Hydrate>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  const client = createClient();

  const todo = await fetchQuery(client, queryTodo);

  return {
    props: {
      fallback: {
        ...todo
      },
    },
  }
}

export default SSR;
