import 'jest-preset-angular/setup-jest';

import { mobx } from '@datx/utils';

import mobxInstance from './projects/datx-jsonapi-angular/test/mobx';

if (parseInt(process.env.MOBX_VERSION || '0', 10) < 0) {
  mobx.useMobx(false);
}

if ('configure' in mobxInstance) {
  // safe to do since we'll never enter this block if configure is not available in mobxInstance
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignores
  mobxInstance.configure({
    enforceActions: 'observed',
    // computedRequiresReaction: true,
  });
}
