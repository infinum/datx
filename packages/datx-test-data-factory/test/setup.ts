import { mobx } from '@datx/utils';

if (parseInt(process.env.MOBX_VERSION || '0', 10) < 0) {
  mobx.useMobx(false);
}
