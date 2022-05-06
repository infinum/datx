import { useState } from 'react';
import { ClientInstance } from '../interfaces/Client';
import { CreateClientFn } from '../interfaces/CreateClientFn';

let client: ClientInstance;

/**
 * It's important to create an entirely new instance of Datx Client for each request.
 * Otherwise, your response to a request might include sensitive cached query results from a previous request.
 */
const initialize = (createClient: CreateClientFn) => {
  const _client = client ?? createClient();

  // For SSG and SSR always create a new Client
  if (typeof window === 'undefined') {
    return _client;
  }
  // Create the GraphQL Client once in the client
  if (!client) {
    client = _client;
  }

  return _client;
};

export function useInitialize(createClient: CreateClientFn): ClientInstance {
  const [client] = useState(() => initialize(createClient));

  return client;
}
