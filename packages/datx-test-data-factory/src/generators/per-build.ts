export const perBuildType = 'perBuild' as const;

export interface PerBuildGenerator<T> {
	type: typeof perBuildType;
	call: () => T;
}

export const perBuild = <T>(fn: () => T) => ({
	type: perBuildType,
	call: () => fn(),
});
