import { configure } from 'mobx';
import { clearAllCache } from '../src/cache';

configure({
  enforceActions: 'observed',
  // computedRequiresReaction: true,
});

beforeEach(() => {
  clearAllCache();
});
