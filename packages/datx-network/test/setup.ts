import { mobx } from 'datx-utils';

if (parseInt(process.env.MOBX_VERSION || '0', 10) < 0) {
  mobx.useMobx(false);
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mobxInstance = require('./mobx');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { clearAllCache } = require('../src/interceptors/cache');

// @ts-ignore
mobxInstance.configure({
  enforceActions: 'observed',
  // computedRequiresReaction: true,
});

beforeEach(() => {
  clearAllCache();
});
