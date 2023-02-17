export const sequenceType = 'sequence' as const;

export interface SequenceGenerator<T> {
	type: typeof sequenceType;
	call: (counter: number) => T;
}

export type Sequence = {
	(): SequenceGenerator<number>;
	<T>(callback?: (count: number) => T): SequenceGenerator<T>;
};

export const sequence: Sequence = <T>(fn?: (counter: number) => T) => ({
	type: sequenceType,
	call: (counter: number) => {
		if (typeof fn === 'undefined') {
			return counter;
		}

		return fn(counter);
	},
});
