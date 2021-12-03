import type { NextPage } from 'next';
import NextLink from 'next/link';

const Home: NextPage = () => {
  return (
    <ul>
      <li>
        <NextLink href="/todos/csr">
          <a>Client side rendering</a>
        </NextLink>
      </li>
      <li>
        <NextLink href="/todos/ssr">
          <a>Server side rendering</a>
        </NextLink>
      </li>
    </ul>
  )
}

export default Home;
