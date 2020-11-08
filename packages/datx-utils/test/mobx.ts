import { mobx } from '../src';

let testMobx = mobx;

Object.assign(mobx, {
  configure() {
    // noop
  },
  isComputedProp(_val: any): boolean {
    return false;
  }
});

if ([-1, 0].includes(parseInt(process.env.MOBX_VERSION || '0', 10))) {
  testMobx = require('mobx');
}

export default testMobx;
