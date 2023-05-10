export interface IFetchQueryConfiguration {
  /**
   * fetchQuery will not throw on error
   */
  prefetch?: boolean | ((res: unknown) => boolean);

  /**
   * It should save the response to the cache so it can be hydrated on the client
   *
   * @default true
   */
  hydrate?: boolean;
}
