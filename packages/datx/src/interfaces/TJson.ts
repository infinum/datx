// https://github.com/microsoft/TypeScript/issues/1897
export type TJson = string | number | boolean | null | Array<TJson> | { [key: string]: TJson };
