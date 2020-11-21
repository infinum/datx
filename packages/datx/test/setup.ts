import { useMobx } from '../src';

if (parseInt(process.env.MOBX_VERSION || '0', 10) < 0) {
  useMobx(false);
}