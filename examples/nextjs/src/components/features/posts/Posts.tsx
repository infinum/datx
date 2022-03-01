import { useQuery } from '@datx/swr';
import { FC, useState } from 'react';

import { ErrorFallback } from '../../shared/errors/ErrorFallback/ErrorFallback';
import { queryPosts } from './Posts.queries';

export const Posts: FC = () => {
  const [pageIndex, setPageIndex] = useState(0);

  const { data, error } = useQuery(queryPosts);

  if (error) {
    return <ErrorFallback error={error} />;
  }

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {data.data?.map((post) => (
        // <NextLink href={`${base}/todos/${post.id}`} key={post.id}>
        <a style={{ display: 'block' }} key={post.id}>
          {post.body}
        </a>
        // </NextLink>
      ))}

      <button onClick={() => setPageIndex(pageIndex - 1)}>Previous</button>
      <button onClick={() => setPageIndex(pageIndex + 1)}>Next</button>
    </div>
  );
};
