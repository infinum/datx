import mobx from './mobx';

if (parseInt(process.env.MOBX_VERSION || '0', 10) < 0) {
  mobx.useMobx(false);
}

// @ts-ignore
mobx.configure({
  enforceActions: 'observed',
  // computedRequiresReaction: true,
});
