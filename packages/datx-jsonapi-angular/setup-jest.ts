import 'jest-preset-angular/setup-jest';

import { mobx } from '@datx/utils';

import mobxInstance from './projects/datx-jsonapi-angular/test/mobx';

if (parseInt(process.env.MOBX_VERSION || '0', 10) < 0) {
  mobx.useMobx(false);
}

if ('configure' in mobxInstance) {
  // @ts-ignores
  mobxInstance.configure({
    enforceActions: 'observed',
    // computedRequiresReaction: true,
  });
}
