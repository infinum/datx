import { configure } from 'mobx';

configure({
  enforceActions: 'observed',
  // computedRequiresReaction: true,
});
