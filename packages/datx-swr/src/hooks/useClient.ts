import { useContext } from 'react';

import DatxContext from '../context';

export function useClient() {
  const context = useContext(DatxContext);

  if (!context) {
    throw new Error('useDatx must be used within a DatxProvider');
  }

  return context;
}
