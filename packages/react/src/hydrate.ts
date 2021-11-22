import { Collection } from '@datx/core';

export const hydrate = (store: Collection, fallback: Record<string, any>) => {
  return Object.keys(fallback).reduce((previousValue, currentValue) => {
    const data = fallback[currentValue];

    if (store && data) {
      if (Array.isArray(data)) {
        previousValue[currentValue] = data.map(
          (rowResponse) => {
            // TODO - figure out hot wo abstract json:api Response
            // new Response({ data: rowResponse, status: 200 }, store)
          }
        );
      }
      // TODO - figure out hot wo abstract json:api Response
      // previousValue[currentValue] = new Response({ data, status: 200 }, store);
    }

    return previousValue;
  }, {});
};
