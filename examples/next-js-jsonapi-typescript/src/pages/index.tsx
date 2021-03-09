import Link from 'next/link';

import Layout from '@/components/shared/layouts/Layout';

const HomePage = () => (
  <Layout title="Home | Next.js + TypeScript Example">
    <h1>Hello Datx and Next.js 👋</h1>
    <p>
      <Link href="/about">
        <a>About</a>
      </Link>
    </p>
  </Layout>
);

export default HomePage;
