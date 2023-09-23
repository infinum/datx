import { Response } from '@datx/jsonapi';
import { FC } from 'react';

const getErrorMessage = (error: unknown) => {
  if (error instanceof Response) {
    if (error.error instanceof Error) {
      return error.error.message;
    } else {
      return error.error?.[0].detail;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
};

export const ErrorFallback: FC<{ error: Response | Error }> = ({ error }) => {
  const message = getErrorMessage(error);

  return (
    <div style={{ border: '1px solid red', padding: '20px' }}>
      <h1 style={{ color: 'red', margin: 0 }}>Error</h1>
      <code>{message}</code>
    </div>
  );
};
