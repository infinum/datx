import { Response } from '@datx/jsonapi';
import { JsonapiCollection } from './types';

export const hydrate = (store: JsonapiCollection, fallback: Record<string, any>) => {
  return Object.keys(fallback).reduce((previousValue, currentValue) => {
    const data = fallback[currentValue];

    if (store && data) {
      if (Array.isArray(data)) {
        previousValue[currentValue] = data.map(
          (rowResponse) => {
            new Response({ data: rowResponse, status: 200 }, store)
          }
        );
      }
      previousValue[currentValue] = new Response({ data, status: 200 }, store);
    }

    return previousValue;
  }, {});
};
