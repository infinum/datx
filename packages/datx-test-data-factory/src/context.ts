import { IFactoryContext, IFactoryContextValue } from './types';

const getValue = (): IFactoryContextValue => ({
  sequenceCounterMap: new Map(),
});

export const createContext = (): IFactoryContext => {
  const value = getValue();

  const reset = () => {
    Object.assign(value, getValue());
  };

  return {
    value,
    reset,
  };
};
