/* eslint-disable @typescript-eslint/no-empty-interface */

export interface IObservable {};

export interface IObservableArray<T = any> extends Array<T> {
  replace(data: Array<T>): Array<T>;
};

interface IArrayBaseChange<T> {
  object: IObservableArray<T>;
  observableKind: "array";
  debugObjectName: string;
  index: number;
}

export interface IArraySplice<T = any> extends IArrayBaseChange<T> {
  type: "splice";
  added: T[];
  addedCount: number;
  removed: T[];
  removedCount: number;
}

export interface IReactionDisposer {
  (): void;
}
