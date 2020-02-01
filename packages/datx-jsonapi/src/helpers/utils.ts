import { IFieldDefinition, IReferenceDefinition, PureModel } from 'datx';
import { getMeta } from 'datx-utils';

declare var window: object;

// tslint:disable-next-line:no-typeof-undefined - The alternative breaks on node
export const isBrowser: boolean = typeof window !== 'undefined';

/**
 * Returns the value if it's not a function. If it's a function
 * it calls it.
 *
 * @export
 * @template T
 * @param {(T|(() => T))} target can be  anything or function
 * @returns {T} value
 */
export function getValue<T>(target: T | (() => T)): T {
  if (typeof target === 'function') {
    // @ts-ignore
    return target();
  }

  return target;
}

export function error(message: string): Error {
  return new Error(`[datx exception] ${message}`);
}

export function getModelClassRefs(type: typeof PureModel | PureModel) {
  const fields: Record<string, IFieldDefinition> = getMeta(type, 'fields', {}, true, true);
  const refs: Record<string, IReferenceDefinition> = {};

  Object.keys(fields).forEach((key) => {
    if (fields[key].referenceDef) {
      refs[key] = fields[key].referenceDef as IReferenceDefinition;
    }
  });

  return refs;
}
