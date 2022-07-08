export interface IConstructor<T = unknown> {
    new (...args: Array<unknown>): T;
}
