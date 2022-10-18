import { warn } from './helpers';
import { IObservableArray, IReactionDisposer } from './interfaces/IMobX';

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

  set(obj: Record<string, any>, key: string | Record<string, any>, value?: any): void {
    if (typeof key === 'string') {
      if (key !== '__proto__') {
        obj[key] = value;
      }
    } else if (!('__proto__' in obj)) {
      Object.assign(obj, key);
    }
  },

  extendObservable<T extends object, U extends object>(obj: T, prop: U): T & U {
    const desc = Object.getOwnPropertyDescriptors(prop);
    return Object.defineProperties(obj, desc) as T & U;
  },

  observable<T extends object>(_obj: T, ..._params: Array<any>): void {
    // return obj;
  },

  computed(...params: Array<any>): any {
    return params[2];
  },

  action(...params: Array<any>): any {
    if (params.length === 1) {
      return params[0];
    }
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

  intercept<T>(
    target: T,
    propertyName: keyof T | Function,
    _interceptor?: Function,
  ): IReactionDisposer {
    Object.freeze(typeof propertyName === 'string' ? target[propertyName] : target);
    return noop;
  },
};

// @ts-ignore
noopMobX.observable.object = (obj: T): T => obj;

// @ts-ignore
noopMobX.observable.array = (obj: T): T => obj;

class MobXProxy {
  private _useRealMobX = true;
  private access = false;
  // eslint-disable-next-line @typescript-eslint/prefer-readonly
  private hasMobX = false;

  public constructor() {
    let mobx: any;
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      mobx = require('mobx');
      this.hasMobX = Boolean(mobx?.observable);
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
          /* eslint-disable @typescript-eslint/no-var-requires */
          if (!mobxProxyInstance.hasMobX && mobxProxyInstance._useRealMobX) {
            warn(
              'MobX not installed. Falling back to the static approach. Import `datx/disable-mobx` before the first `datx` import to disable this warning',
            );
          }

          mobxProxyInstance.access = true;
          if (mobxProxyInstance.useRealMobX) {
            return mobx[key];
          }
          // @ts-ignore
          return noopMobX[key];
        },
      });
    });
  }

  public useMobx(enabled: boolean): void {
    if (this.access) {
      throw new Error(
        '[datx] MobX was already used. Please move this function call to somewhere earlier.',
      );
    }
    this._useRealMobX = enabled;
  }

  public get useRealMobX(): boolean {
    return this._useRealMobX && this.hasMobX;
  }

  public get makeObservable(): any {
    if (this.useRealMobX) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const mobx = require('mobx');
        return mobx.makeObservable || noopMobX.makeObservable;
      } catch {
        // no mobx installed
        return noopMobX.makeObservable;
      }
    }
    return noopMobX.makeObservable;
  }
}

type TObservableDecorator = <T extends object>(obj: T, ..._params: Array<any>) => void;
type TObservable = {
  object: <T extends object>(obj: T, decorators?: object, opts?: object) => T;
  array: <T = any>(obj: Array<T>, decorators?: object, opts?: object) => IObservableArray<T>;
} & TObservableDecorator;

export const mobx = new MobXProxy() as unknown as typeof noopMobX & {
  useRealMobX: boolean;
  useMobx: (enabled: boolean) => void;
  observable: TObservable;
};
