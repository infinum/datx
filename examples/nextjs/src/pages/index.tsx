import type { NextPage } from 'next';
import NextLink from 'next/link';

const Home: NextPage = () => {
  return (
    <ul>
      <li>
        <NextLink href="/csr/todos">Todo App - Client side rendering</NextLink>
      </li>
      <li>
        <NextLink href="/ssr/todos">Todo App - Server side rendering</NextLink>
      </li>
    </ul>
  );
};

export default Home;
