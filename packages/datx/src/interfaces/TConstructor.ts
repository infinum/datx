// Handle the basic constructors (String, Date, Boolean, etc.) and custom class constructors
export interface TConstructor<T extends any = any> {
  new (...args: Array<any>): T;
}
