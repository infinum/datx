import type { NextPage } from 'next';
import NextLink from 'next/link';

const Home: NextPage = () => {
  return (
    <ul>
      <li>
        <NextLink href="/csr/todos">
          <a>Todo App - Client side rendering</a>
        </NextLink>
      </li>
      <li>
        <NextLink href="/ssr/todos">
          <a>Todo App - Server side rendering</a>
        </NextLink>
      </li>
    </ul>
  )
}

export default Home;
