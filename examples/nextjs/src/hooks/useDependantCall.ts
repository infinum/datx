import { useState, useEffect } from 'react';

export const useDependantCall = () => {
  const [shouldFetch, setShouldFetch] = useState(false);

  useEffect(() => {
    let timeout = setTimeout(() => {
      setShouldFetch(true);
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  return shouldFetch;
};
