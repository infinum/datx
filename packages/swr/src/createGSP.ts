import { createGSSP } from './createGSSP';

/**
 * Factory function for creating a decorator for getStaticProps
 *
 * @param createClient Factory function for creating a json:api swr client
 */
export const createGSP = createGSSP;
