/**
 * Map a single item or an array of items
 *
 * @export
 * @template T
 * @template U
 * @param {(T|Array<T>)} data Data to iterate over
 * @param {(item: T) => U} fn Function called for every data item
 * @returns {(U|Array<U>|null)} Return value of the callback function
 */
export declare function mapItems<T, U>(data: T, fn: (item: T) => U): U | null;
export declare function mapItems<T, U>(data: Array<T>, fn: (item: T) => U): Array<U>;
/**
 * Flatten a 2D array to a single array
 *
 * @export
 * @template T
 * @param {Array<Array<T>>} data Arrays to flatten
 * @returns {Array<T>} Flattened array
 */
export declare function flatten<T>(data: Array<Array<T>>): Array<T>;
/**
 * Return a unique set of items in an array
 *
 * @export
 * @template T
 * @param {Array<T>} data Array to filter
 * @returns {Array<T>} Filtered array
 */
export declare function uniq<T>(data: Array<T>): Array<T>;
/**
 * Check if the given variable is an array with at least one falsy value
 *
 * @export
 * @param {any} value A variable to check
 * @returns {boolean} The given variable is an array with at least one falsy value
 */
export declare function isFalsyArray(value: any): boolean;
