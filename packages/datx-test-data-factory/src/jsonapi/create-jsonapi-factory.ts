import { PureCollection } from '@datx/core';
import { createContext } from '../context';
import { IJsonapiConfiguration, ModelType } from '../types';
import { createJsonapiBuilder } from './create-jsonapi-builder';

export const createJsonapiFactory = <TCollection extends PureCollection>(client: TCollection) => {
  const factory = <TModelType extends ModelType>(
    model: TModelType,
    config?: IJsonapiConfiguration<TModelType>,
  ) => {
    const context = createContext();

    return createJsonapiBuilder({ client, model, config, context });
  };

  factory.reset = () => {
    client.reset();
  };

  return factory;
};
