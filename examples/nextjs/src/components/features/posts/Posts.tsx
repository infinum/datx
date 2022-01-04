import {
  useQuery,
} from '@datx/swr';
import { FC, useState } from 'react';
import NextLink from 'next/link';

import { ErrorFallback } from '../../shared/errors/ErrorFallback/ErrorFallback';
import { Post } from '../../../models/Post';

export const Posts: FC = () => {
  const [pageIndex, setPageIndex] = useState(0);

  const { data, error } = useQuery({ op: 'getMany', type: Post });

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
          <a style={{ display: 'block' }} key={post.id}>{post.body}</a>
        // </NextLink>
      ))}

      <button onClick={() => setPageIndex(pageIndex - 1)}>Previous</button>
      <button onClick={() => setPageIndex(pageIndex + 1)}>Next</button>
    </div>
  );
};
