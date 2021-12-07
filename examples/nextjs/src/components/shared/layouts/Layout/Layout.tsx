import { useRouter } from 'next/dist/client/router';
import { FC } from 'react';

export const Layout: FC = ({ children }) => {
  const router = useRouter();

  return (
    <div>
      <div style={{ paddingBottom: '20px' }}>
        <button onClick={() => router.back()}>GO BACK</button>
      </div>
      {children}
    </div>
  );
};
