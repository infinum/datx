import { Client } from '../src/datx/createClient';

declare module '@datx/swr' {
  export interface IClient extends Client {
    types: Client['types'];
  }
}
