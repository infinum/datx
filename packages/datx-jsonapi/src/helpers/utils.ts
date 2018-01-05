declare var window: object;

export const isBrowser: boolean = (typeof window !== 'undefined');

/**
 * Returns the value if it's not a function. If it's a function
 * it calls it.
 *
 * @export
 * @template T
 * @param {(T|(() => T))} target can be  anything or function
 * @returns {T} value
 */
export function getValue<T>(target: T|(() => T)): T {
  if (typeof target === 'function') {
    return target();
  }

  return target;
}
