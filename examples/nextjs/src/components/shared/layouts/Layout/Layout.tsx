import { useRouter } from 'next/dist/client/router';
import { FC, PropsWithChildren } from 'react';

export const Layout: FC<PropsWithChildren<unknown>> = ({ children }) => {
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
