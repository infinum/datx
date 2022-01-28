import { PureModel } from '@datx/core';
import { getMeta, setMeta } from '@datx/utils';

export function isModelPersisted(model: PureModel): boolean {
  return getMeta(model, 'PERSISTED', false);
}

export function setModelPersisted(model: PureModel, state = true): void {
  setMeta(model, 'PERSISTED', state);
}
