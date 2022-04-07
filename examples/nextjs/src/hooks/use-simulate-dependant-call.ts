import { useState, useEffect } from 'react';

export const useSimulateDependantCall = (value: string | number, delay = 3000) => {
  const [deferredValue, setDeferredValue] = useState<typeof value>();

  useEffect(() => {
    let timeout = setTimeout(() => {
      setDeferredValue(value);
    }, delay);

    return () => clearTimeout(timeout);
  }, [value, delay]);

  return deferredValue;
};
