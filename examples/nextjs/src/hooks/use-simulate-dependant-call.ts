import { useState, useEffect } from 'react';

export const useSimulateDependantCall = <T>(value: T, delay = 3000) => {
  const [deferredValue, setDeferredValue] = useState<T | undefined>();

  useEffect(() => {
    let timeout = setTimeout(() => {
      setDeferredValue(value);
    }, delay);

    return () => clearTimeout(timeout);
  }, [value, delay]);

  return deferredValue;
};
