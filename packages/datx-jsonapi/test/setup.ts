import { mobx } from 'datx-utils';

import mobxInstance from './mobx';

if (parseInt(process.env.MOBX_VERSION || '0', 10) < 0) {
  mobx.useMobx(false);
}

// @ts-ignore
mobxInstance.configure({
  enforceActions: 'observed',
  // computedRequiresReaction: true,
});
