export const sequenceType = 'sequence' as const;

export interface ISequenceGenerator<T> {
  type: typeof sequenceType;
  call: (counter: number) => T;
}

export interface ISequence {
  (): ISequenceGenerator<number>;
  <T>(callback?: (count: number) => T): ISequenceGenerator<T>;
}

export const sequence: ISequence = <T>(fn?: (counter: number) => T) => ({
  type: sequenceType,
  call: (counter: number) => {
    if (typeof fn === 'undefined') {
      return counter;
    }

    return fn(counter);
  },
});
