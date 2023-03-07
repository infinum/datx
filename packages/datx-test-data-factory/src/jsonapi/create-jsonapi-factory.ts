import { PureCollection } from '@datx/core';
import { createContext } from '../context';
import { IConfiguration, ModelType } from '../types';
import { createJsonapiBuilder } from './create-jsonapi-builder';

/**
 * @deprecated `createFactory` now supports jsonapi type of collections
 */
export const createJsonapiFactory = <TCollection extends PureCollection>(client: TCollection) => {
  const factory = <TModelType extends ModelType>(
    model: TModelType,
    config?: IConfiguration<TModelType>,
  ) => {
    const context = createContext();

    return createJsonapiBuilder({ client, model, config, context });
  };

  factory.reset = () => {
    client.reset();
  };

  return factory;
};
