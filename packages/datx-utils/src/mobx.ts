import { warn } from "./helpers";
import { IReactionDisposer } from "./interfaces/IMobX";

const noop = (): void => {
  // Nothing to do
};

const noopMobX = {
  autorun(fn: Function): IReactionDisposer {
    fn(); // Call it the first time
    return noop;
  },

  isObservableArray(_obj: any): boolean {
    return false;
  },

  set(obj: Record<string, any>, key: string, value: any): void {
    obj[key] = value;
  },

  extendObservable<T extends object, U extends object>(obj: T, prop: U): T & U {
    const desc = Object.getOwnPropertyDescriptors(prop);
    return Object.defineProperties(obj, desc);
  },

  observable<T extends object>(obj: T, ..._params: Array<any>): T & {
    array: (obj: T, ...params: Array<any>) => T,
    object: (obj: T, ...params: Array<any>) => T
  } {
    // @ts-ignore
    return obj;
  },

  computed(...params: Array<any>): any {
    return params[2];
  },

  action(...params: Array<any>): any {
    return params[2];
  },

  makeObservable(_target: any, _annotations?: any): void {
    // noop by default
  },

  runInAction(fn: Function): void {
    fn();
  },

  toJS<T>(val: T): T {
    return val;
  },

  reaction(data: Function, action: Function): IReactionDisposer {
    data();
    action();
    return noop;
  },

  intercept<T>(target: T, propertyName: keyof T | Function, _interceptor?: Function): IReactionDisposer {
    Object.freeze(typeof propertyName === 'string' ? target[propertyName] : target);
    return noop;
  },
};

// @ts-ignore
noopMobX.observable.object = (obj: T): T => obj;

// @ts-ignore
noopMobX.observable.array = (obj: T): T => obj;

class MobXProxy {
  public readonly useRealMobX = true;
  private access = false;
  private hasMobX = false;

  constructor() {
    try {
      require('mobx');
      this.hasMobX = true;
    } catch {
      // Nothing to do
    }

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const mobxProxyInstance = this;

    Object.keys(noopMobX).forEach((key) => {
      if (key in this) {
        return;
      }
      Object.defineProperty(this, key, {
        get() {
          if (!mobxProxyInstance.hasMobX && mobxProxyInstance.useRealMobX) {
            warn('MobX not installed. Falling back to the static approach. Call `mobx.useMobx(false)` to disable this warning');
          }

          mobxProxyInstance.access = true;
          if (!mobxProxyInstance.hasMobX || mobxProxyInstance.useRealMobX) {
            return require('mobx')[key];
          }
          // @ts-ignore
          return noopMobX[key];
        }
      });
    });
  }

  useMobx(enabled: boolean): void {
    if (this.access) {
      throw new Error('[datx] MobX was already used. Please move this function call to somewhere earlier.');
    }
    // @ts-ignore
    this.useRealMobX = enabled;
  }

  public get makeObservable(): any {
    if (this.useRealMobX) {
      try {
        return require('mobx').makeObservable;
        // mobx 6
      } catch {
        // mobx 4/5
        return noopMobX.makeObservable;
      }
    }
    return noopMobX.makeObservable;
  }
}

export const mobx = new MobXProxy() as unknown as typeof noopMobX & { useRealMobX: boolean, useMobx: (enabled: boolean) => void };