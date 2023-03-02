import { IConfiguration, ModelType } from './types';
import { createContext } from './context';
import { PureCollection } from '@datx/core';
import { createBuilder } from './create-builder';

export const createFactory = <TCollection extends PureCollection>(client: TCollection) => {
  const factory = <TModelType extends ModelType>(
    model: TModelType,
    config?: IConfiguration<TModelType>,
  ) => {
    const context = createContext();

    return createBuilder({ client, model, config, context });
  };

  factory.reset = () => {
    client.reset();
  };

  return factory;
};
