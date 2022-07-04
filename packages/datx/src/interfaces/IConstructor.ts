// Handle the basic constructors (String, Date, Boolean, etc.) and custom class constructors
export interface IConstructor<T = unknown> {
  new (...args: Array<unknown>): T;
}
